import { Injectable } from '@nestjs/common';
import { InterfaceGisRepository } from '../../../../domain/contracts/gis.interface.repository';
import { MapGeojsonResponse } from '../../../../domain/schemas/response/map-geojson';
import { DatabaseAbstract } from '../../../../../../shared/connections/database/abstract/abstract.database';
import { MapGeojsonSqlResult } from '../../../interfaces/map-geojson.sql.result';
import { GisAdapter } from '../../../adapters/gis.adapter';

import { ScadaTelemetryResponse } from '../../../../domain/schemas/response/scada-telemetry';
import { ScadaTelemetrySqlResult } from '../../../interfaces/scada-telemetry.sql.result';

@Injectable()
export class GisPostgreSQLPersistence implements InterfaceGisRepository {
  constructor(private readonly databaseService: DatabaseAbstract) {}

  async getNetworkMapGeoJson(): Promise<MapGeojsonResponse> {
    const query = /*sql*/ `
      SELECT jsonb_build_object(
          'type',     'FeatureCollection',
          'features', COALESCE(jsonb_agg(features.feature), '[]'::jsonb)
      ) AS map_geojson
      FROM (
          -- ==========================================
          -- 1. TANK POINTS (Installations)
          -- ==========================================
          SELECT jsonb_build_object(
              'type',       'Feature',
              'id',         'tank_' || i.id,
              'geometry',   ST_AsGeoJSON(i.coordenadas)::jsonb,
              'properties', jsonb_build_object(
                  'node_type', 'TANK',
                  'name', i.nombre,
                  'code', i.codigo,
                  'color_marker', '#FF0000'
              )
          ) AS feature
          FROM hidraulica.instalacion i
          WHERE i.tipo_id IN (1, 3, 4) AND i.coordenadas IS NOT NULL

          UNION ALL

          -- ==========================================
          -- 2. CONNECTION POINTS (Houses)
          -- ==========================================
          SELECT jsonb_build_object(
              'type',       'Feature',
              'id',         'connection_' || a.acometida_id,
              'geometry',   ST_AsGeoJSON(a.coordenadas)::jsonb,
              'properties', jsonb_build_object(
                  'node_type', 'CONNECTION',
                  'connection_id', a.acometida_id,
                  'cadastral_key', a.clave_catastral,
                  'supplied_by_tank', i.nombre,
                  'color_marker', '#0000FF'
              )
          ) AS feature
          FROM public.acometida a
          JOIN hidraulica.acometida_fuente af ON a.acometida_id = af.acometida_id
          JOIN hidraulica.instalacion i ON af.instalacion_id = i.id
          WHERE af.es_activa = true AND a.coordenadas IS NOT NULL

          UNION ALL

          -- ==========================================
          -- 3. VIRTUAL LINKS (Tank ---> House)
          -- ==========================================
          SELECT jsonb_build_object(
              'type',       'Feature',
              'geometry',   ST_AsGeoJSON(ST_MakeLine(i.coordenadas, a.coordenadas))::jsonb,
              'properties', jsonb_build_object(
                  'node_type', 'VIRTUAL_LINK',
                  'source', i.nombre,
                  'destination', a.acometida_id,
                  'distance_meters', ROUND(ST_Distance(i.coordenadas::geography, a.coordenadas::geography)::numeric, 2)
              )
          ) AS feature
          FROM public.acometida a
          JOIN hidraulica.acometida_fuente af ON a.acometida_id = af.acometida_id
          JOIN hidraulica.instalacion i ON af.instalacion_id = i.id
          WHERE af.es_activa = true 
            AND a.coordenadas IS NOT NULL 
            AND i.coordenadas IS NOT NULL
      ) AS features;
    `;

    const result = await this.databaseService.query<MapGeojsonSqlResult>(query);
    return GisAdapter.toResponse(
      (result[0] as unknown as { map_geojson?: MapGeojsonSqlResult })
        ?.map_geojson || { type: 'FeatureCollection', features: [] },
    );
  }

  async getScadaTelemetry(): Promise<ScadaTelemetryResponse[]> {
    const query = /*sql*/ `
      SELECT 
          i.id AS tank_id,
          i.nombre AS tank_name,
          cti.nombre AS facility_type,
          cei.nombre AS system_status,
          t.capacidad_maxima_m3 AS max_capacity,
          t.nivel_maximo_m AS max_level_m,
          
          -- 1. TELEMETRÍA: Nivel
          (
            SELECT json_build_object(
                'value', ls.valor,
                'unit', cps.unidad_medida,
                'percentage', ROUND((ls.valor / NULLIF(t.nivel_maximo_m, 0)) * 100, 1),
                'timestamp', ls.fecha_hora
            )
            FROM hidraulica.punto_medicion pm
            JOIN hidraulica.cat_parametro_scada cps ON pm.parametro_id = cps.id
            JOIN hidraulica.lectura_scada ls ON ls.punto_medicion_id = pm.id
            WHERE pm.instalacion_id = i.id AND cps.codigo = 'NIVEL'
            ORDER BY ls.fecha_hora DESC LIMIT 1
          ) AS level_telemetry,

          -- 2. TELEMETRÍA: Caudal de Salida
          (
            SELECT json_build_object(
                'value', ls.valor,
                'unit', cps.unidad_medida,
                'timestamp', ls.fecha_hora
            )
            FROM hidraulica.punto_medicion pm
            JOIN hidraulica.cat_parametro_scada cps ON pm.parametro_id = cps.id
            JOIN hidraulica.lectura_scada ls ON ls.punto_medicion_id = pm.id
            WHERE pm.instalacion_id = i.id AND cps.codigo = 'CAUDAL_OUT'
            ORDER BY ls.fecha_hora DESC LIMIT 1
          ) AS flow_telemetry,

          -- 3. TELEMETRÍA: Presión
          (
            SELECT json_build_object(
                'value', ls.valor,
                'unit', cps.unidad_medida,
                'timestamp', ls.fecha_hora
            )
            FROM hidraulica.punto_medicion pm
            JOIN hidraulica.cat_parametro_scada cps ON pm.parametro_id = cps.id
            JOIN hidraulica.lectura_scada ls ON ls.punto_medicion_id = pm.id
            WHERE pm.instalacion_id = i.id AND cps.codigo = 'PRESION'
            ORDER BY ls.fecha_hora DESC LIMIT 1
          ) AS pressure_telemetry

      FROM hidraulica.instalacion i
      JOIN hidraulica.cat_tipo_instalacion cti ON i.tipo_id = cti.id
      JOIN hidraulica.cat_estado_instalacion cei ON i.estado_id = cei.id
      LEFT JOIN hidraulica.tanque_operacion t ON t.instalacion_id = i.id
      ORDER BY cti.nombre, i.nombre ASC;
    `;

    const result = await this.databaseService.query<ScadaTelemetrySqlResult>(query);
    return GisAdapter.toScadaTelemetryResponse(result);
  }
}
