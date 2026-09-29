import { Injectable } from '@nestjs/common';
import { InterfaceGisRepository } from '../../../../domain/contracts/gis.interface.repository';
import { MapGeojsonResponse } from '../../../../domain/schemas/response/map-geojson';
import { DatabaseAbstract } from '../../../../../../shared/connections/database/abstract/abstract.database';
import { MapGeojsonSqlResult } from '../../../interfaces/map-geojson.sql.result';
import { GisAdapter } from '../../../adapters/gis.adapter';

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
}
