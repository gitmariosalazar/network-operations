export interface INovelty {
  id: number;
  title: string;
  description: string;
  minPercentage: number | null;
  maxPercentage: number | null;
  actionRecommended: string;
}
/*
export const NOVELTIES: Record<number, INovelty> = {
  1: {
    id: 1,
    title: 'NORMAL',
    description:
      'Consumo dentro del rango esperado (60-140% del promedio). Uso normal sin anomalías detectadas. Actual: {{currentConsumption}} m3, Promedio: {{average}} m3.',
    minPercentage: 60.0,
    maxPercentage: 140.0,
    actionRecommended: 'Registrar lectura normalmente. Monitoreo estándar.',
  },
  2: {
    id: 2,
    title: 'CONSUMO BAJO',
    description:
      'Consumo bajo (20-59.99% del promedio). Indica posible ausencia prolongada o medidor lento. Actual: {{currentConsumption}} m3, Promedio: {{average}} m3.',
    minPercentage: 20.0,
    maxPercentage: 59.99,
    actionRecommended:
      'Verificar medidor. Contactar cliente. Agendar seguimiento.',
  },
  3: {
    id: 3,
    title: 'CONSUMO ALTO',
    description:
      'Consumo alto (140.01-200% del promedio). Posible fuga menor o uso intensivo temporal. Actual: {{currentConsumption}} m3, Promedio: {{average}} m3.',
    minPercentage: 140.01,
    maxPercentage: 200.0,
    actionRecommended:
      'Inspeccionar en campo. Notificar cliente. Monitoreo próximo ciclo.',
  },
  4: {
    id: 4,
    title: 'CONSUMO MUY BAJO',
    description:
      'Consumo extremadamente bajo (0-19.99% del promedio). Medidor detenido o suministro interrumpido. Actual: {{currentConsumption}} m3, Promedio: {{average}} m3.',
    minPercentage: 0.0,
    maxPercentage: 19.99,
    actionRecommended:
      'INSPECCIÓN URGENTE. Verificar suministro. Registrar anomalía crítica.',
  },
  5: {
    id: 5,
    title: 'CONSUMO EXCESIVO',
    description:
      'Consumo extremadamente alto (>200% del promedio). Fuga grave o error en medidor. Actual: {{currentConsumption}} m3, Promedio: {{average}} m3.',
    minPercentage: 200.01,
    maxPercentage: null,
    actionRecommended:
      'EMERGENCIA: Inspección inmediata. Suspender facturación. Contactar cliente YA.',
  },
  6: {
    id: 6,
    title: 'LECTURA INVÁLIDA',
    description:
      'Lectura inconsistente (actual menor que anterior). Error de medidor o registro. Actual: {{currentConsumption}} m3, Anterior: {{previousReading}} m3.',
    minPercentage: null,
    maxPercentage: null,
    actionRecommended:
      'INSPECCIÓN INMEDIATA. Revisar historial. Registrar anomalía crítica.',
  },
  7: {
    id: 7,
    title: 'SIN LECTURA',
    description:
      'No se pudo obtener lectura por acceso restringido o fallo técnico. Promedio: {{average}} m3.',
    minPercentage: null,
    maxPercentage: null,
    actionRecommended:
      'Programar nueva visita. Notificar cliente. Usar promedio histórico.',
  },
};
*/
/**
 * Determina el tipo de novedad de consumo basado en las lecturas actual y anterior comparadas con el promedio.
 * @param previousReading - La lectura anterior del medidor (en m3).
 * @param currentReading - La lectura actual del medidor (en m3).
 * @param average - El consumo promedio (en m3).
 * @returns Un objeto con el ID, título, descripción, minPercentage, maxPercentage y acción recomendada de la novedad.
 * @throws Error si los valores de entrada son inválidos.
 */
export function getTypeCurrentConsumption(
  previousReading: number | null,
  currentReading: number | null,
  average: number | null,
  novelties: INovelty[], // <-- Nuevo parámetro dinámico
): INovelty {
  // Helper para buscar y sanitizar la novedad por ID
  const getNoveltyById = (id: number): INovelty => {
    const found = novelties.find((n) => n.id === id);
    if (!found) {
      throw new Error(
        `Novedad con ID ${id} no encontrada en la base de datos.`,
      );
    }
    return {
      id: found.id,
      title: found.title,
      description: found.description,
      minPercentage:
        found.minPercentage != null
          ? parseFloat(found.minPercentage as any)
          : null,
      maxPercentage:
        found.maxPercentage != null
          ? parseFloat(found.maxPercentage as any)
          : null,
      actionRecommended: found.actionRecommended,
    };
  };

  // Validar entrada
  if (previousReading == null || currentReading == null || average == null) {
    const sinLectura = getNoveltyById(7); // ID 7: SIN LECTURA
    return {
      ...sinLectura,
      description: sinLectura.description.replace(
        '{{average}}',
        average?.toFixed(2) ?? '—',
      ),
    };
  }

  if (
    !Number.isFinite(previousReading) ||
    !Number.isFinite(currentReading) ||
    !Number.isFinite(average)
  ) {
    throw new Error(
      'Entrada inválida: las lecturas y el promedio deben ser números finitos',
    );
  }

  if (previousReading < 0 || currentReading < 0 || average < 0) {
    throw new Error(
      'Entrada inválida: las lecturas y el promedio no pueden ser negativos',
    );
  }

  if (currentReading < previousReading) {
    const lecturaInvalida = getNoveltyById(6); // ID 6: LECTURA INVÁLIDA
    return {
      ...lecturaInvalida,
      description: lecturaInvalida.description
        .replace(
          '{{currentConsumption}}',
          (currentReading - previousReading).toFixed(2),
        )
        .replace('{{previousReading}}', previousReading.toFixed(2)),
    };
  }

  const currentConsumption = currentReading - previousReading;
  const percentage = average > 0 ? (currentConsumption / average) * 100 : 0;

  // Manejo de casos especiales (Consumo 0)
  if (currentConsumption === 0) {
    const consumoMuyBajo = getNoveltyById(4); // ID 4: CONSUMO MUY BAJO
    return {
      ...consumoMuyBajo,
      description: consumoMuyBajo.description
        .replace('{{currentConsumption}}', currentConsumption.toFixed(2))
        .replace('{{average}}', average.toFixed(2)),
    };
  }

  // Buscar dinámicamente la novedad según el porcentaje
  const matchedNovelty = novelties.find((n) => {
    const min =
      n.minPercentage != null ? parseFloat(n.minPercentage as any) : null;
    const max =
      n.maxPercentage != null ? parseFloat(n.maxPercentage as any) : null;

    // Rango acotado (ej: NORMAL [60 - 140])
    if (min !== null && max !== null) {
      return percentage >= min && percentage <= max;
    }
    // Rango abierto superior (ej: CONSUMO EXCESIVO > 200)
    if (min !== null && max === null) {
      return percentage >= min;
    }
    // Rango abierto inferior
    if (min === null && max !== null) {
      return percentage <= max;
    }
    return false;
  });

  if (matchedNovelty) {
    return {
      id: matchedNovelty.id,
      title: matchedNovelty.title,
      description: matchedNovelty.description
        .replace('{{currentConsumption}}', currentConsumption.toFixed(2))
        .replace('{{average}}', average.toFixed(2)),
      minPercentage:
        matchedNovelty.minPercentage != null
          ? parseFloat(matchedNovelty.minPercentage as any)
          : null,
      maxPercentage:
        matchedNovelty.maxPercentage != null
          ? parseFloat(matchedNovelty.maxPercentage as any)
          : null,
      actionRecommended: matchedNovelty.actionRecommended,
    };
  }

  // Fallback si nada coincide
  const lecturaInvalida = getNoveltyById(6);
  return {
    ...lecturaInvalida,
    description: lecturaInvalida.description
      .replace('{{currentConsumption}}', currentConsumption.toFixed(2))
      .replace('{{previousReading}}', previousReading.toFixed(2)),
  };
}
