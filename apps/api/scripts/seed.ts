import { db } from '../src/lib/db';
import {
  organosJudiciales,
  salas,
  materias,
  tiposAudiencia,
  users,
  expedientes,
  partesProcesales,
  audiencias,
} from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Iniciando seed de datos judiciales (Nicaragua)...');

  // 1. Órgano Judicial Principal
  const organoExistente = await db
    .select()
    .from(organosJudiciales)
    .where(eq(organosJudiciales.codigo, 'JPO-MGA-01'))
    .limit(1);

  let organoId = organoExistente[0]?.id;

  if (!organoId) {
    const [nuevoOrgano] = await db
      .insert(organosJudiciales)
      .values({
        codigo: 'JPO-MGA-01',
        nombre: 'Juzgado Primero de Distrito Penal de Juicio de Managua',
        circunscripcion: 'Managua',
        municipio: 'Managua',
        direccion: 'Complejo Judicial Central Managua, Costado Norte',
      })
      .returning();
    organoId = nuevoOrgano.id;
    console.log('✅ Órgano judicial creado:', nuevoOrgano.nombre);
  }

  // 2. Salas de Audiencia
  const salasExistentes = await db
    .select()
    .from(salas)
    .where(eq(salas.organoJudicialId, organoId));

  let sala1Id = salasExistentes[0]?.id;
  if (salasExistentes.length === 0) {
    const creadas = await db
      .insert(salas)
      .values([
        {
          organoJudicialId: organoId,
          nombre: 'Sala de Audiencias 1',
          capacidad: 25,
          ipMicrofono: '172.16.0.101',
        },
        {
          organoJudicialId: organoId,
          nombre: 'Sala de Audiencias 2',
          capacidad: 20,
          ipMicrofono: '172.16.0.102',
        },
        {
          organoJudicialId: organoId,
          nombre: 'Sala de Audiencias 3',
          capacidad: 30,
          ipMicrofono: '172.16.0.103',
        },
      ])
      .returning();
    sala1Id = creadas[0].id;
    console.log(`✅ ${creadas.length} salas de audiencia creadas.`);
  }

  // 3. Materias
  const listaMaterias = [
    { codigo: 'penal', nombre: 'Penal (Ley N° 406)', color: '#dc2626' },
    { codigo: 'civil', nombre: 'Civil y Mercantil', color: '#2563eb' },
    { codigo: 'laboral', nombre: 'Laboral', color: '#16a34a' },
    { codigo: 'familia', nombre: 'Familia', color: '#d97706' },
    { codigo: 'violencia', nombre: 'Especializada en Violencia', color: '#7c3aed' },
  ];

  for (const m of listaMaterias) {
    const existe = await db
      .select()
      .from(materias)
      .where(eq(materias.codigo, m.codigo))
      .limit(1);
    if (!existe[0]) {
      await db.insert(materias).values(m);
    }
  }
  console.log('✅ Materias verificadas.');

  const [materiaPenal] = await db
    .select()
    .from(materias)
    .where(eq(materias.codigo, 'penal'))
    .limit(1);

  // 4. Tipos de Audiencia Penal (CPP Nicaragua)
  if (materiaPenal) {
    const tipos = [
      { codigo: 'preliminar', nombre: 'Audiencia Preliminar', duracionEstimadaMinutos: 45 },
      { codigo: 'inicial', nombre: 'Audiencia Inicial', duracionEstimadaMinutos: 60 },
      { codigo: 'juicio', nombre: 'Juicio Oral y Público', duracionEstimadaMinutos: 180 },
      { codigo: 'lectura_sentencia', nombre: 'Lectura de Sentencia', duracionEstimadaMinutos: 30 },
      { codigo: 'tutela_garantias', nombre: 'Audiencia de Tutela de Garantías', duracionEstimadaMinutos: 45 },
    ];

    for (const t of tipos) {
      const existe = await db
        .select()
        .from(tiposAudiencia)
        .where(eq(tiposAudiencia.codigo, t.codigo))
        .limit(1);
      if (!existe[0]) {
        await db.insert(tiposAudiencia).values({
          materiaId: materiaPenal.id,
          codigo: t.codigo,
          nombre: t.nombre,
          duracionEstimadaMinutos: t.duracionEstimadaMinutos,
        });
      }
    }
    console.log('✅ Tipos de audiencia CPP verificados.');
  }

  // 5. Usuarios Judiciales Base
  const usuariosSeed = [
    {
      email: 'admin@poderjudicial.gob.ni',
      displayName: 'Administrador del Sistema Judicial',
      role: 'admin' as const,
      password: 'password123',
    },
    {
      email: 'juez.distrito@poderjudicial.gob.ni',
      displayName: 'Dra. María Elena Morales (Juez de Distrito)',
      role: 'juez' as const,
      password: 'password123',
    },
    {
      email: 'secretario.sala@poderjudicial.gob.ni',
      displayName: 'Lic. Roberto Sandino (Secretario Judicial)',
      role: 'secretario' as const,
      password: 'password123',
    },
    {
      email: 'operador.sala@poderjudicial.gob.ni',
      displayName: 'Carlos Miranda (Operador Técnico de Sala)',
      role: 'operador' as const,
      password: 'password123',
    },
    {
      email: 'consulta@poderjudicial.gob.ni',
      displayName: 'Oficina de Acceso a Información',
      role: 'consulta' as const,
      password: 'password123',
    },
  ];

  let juezId: string | null = null;
  let secretarioId: string | null = null;
  let operadorId: string | null = null;

  for (const u of usuariosSeed) {
    const existe = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    let uid = existe[0]?.id;
    if (!uid) {
      const hash = await Bun.password.hash(u.password);
      const [nuevo] = await db
        .insert(users)
        .values({
          email: u.email,
          displayName: u.displayName,
          passwordHash: hash,
          role: u.role,
          organoJudicialId: organoId,
        })
        .returning();
      uid = nuevo.id;
      console.log(`✅ Usuario creado: ${u.displayName} (${u.role})`);
    }

    if (u.role === 'juez') juezId = uid;
    if (u.role === 'secretario') secretarioId = uid;
    if (u.role === 'operador') operadorId = uid;
  }

  // 6. Expediente y Audiencia Demo
  const numExpediente = '001234-ORM4-2026-PN';
  const expExiste = await db
    .select()
    .from(expedientes)
    .where(eq(expedientes.numero, numExpediente))
    .limit(1);

  let expId = expExiste[0]?.id;
  if (!expId && materiaPenal) {
    const [nuevoExp] = await db
      .insert(expedientes)
      .values({
        numero: numExpediente,
        organoJudicialId: organoId,
        materiaId: materiaPenal.id,
        anio: 2026,
        asunto: 'Ministerio Público vs. Roberto Gómez y otros por Robo Agravado',
        delitoOMotivo: 'Robo Agravado con Intimidación',
      })
      .returning();
    expId = nuevoExp.id;

    // Partes procesales
    await db.insert(partesProcesales).values([
      {
        expedienteId: expId,
        nombre: 'Lic. Claudia Fonseca',
        cedula: '001-120584-0021A',
        rol: 'fiscal',
        institucion: 'Ministerio Público de Nicaragua',
        presente: true,
      },
      {
        expedienteId: expId,
        nombre: 'Dr. Alejandro Bermúdez',
        cedula: '001-081079-0014B',
        rol: 'defensor',
        institucion: 'Defensoría Pública',
        presente: true,
      },
      {
        expedienteId: expId,
        nombre: 'Roberto Gómez Martínez',
        cedula: '001-200399-0005F',
        rol: 'acusado',
        presente: true,
      },
    ]);
    console.log('✅ Expediente demo y partes procesales creados:', numExpediente);
  }

  // Audiencia programada demo
  const [tipoJuicio] = await db
    .select()
    .from(tiposAudiencia)
    .where(eq(tiposAudiencia.codigo, 'juicio'))
    .limit(1);

  if (expId && sala1Id && tipoJuicio && juezId) {
    const audExiste = await db
      .select()
      .from(audiencias)
      .where(eq(audiencias.expedienteId, expId))
      .limit(1);

    if (!audExiste[0]) {
      const hoy = new Date().toISOString().split('T')[0];
      await db.insert(audiencias).values({
        expedienteId: expId,
        salaId: sala1Id,
        tipoAudienciaId: tipoJuicio.id,
        juezId: juezId,
        secretarioId: secretarioId,
        operadorId: operadorId,
        fechaProgramada: hoy,
        horaInicioEstimada: '09:00:00',
        horaFinEstimada: '12:00:00',
        livekitRoomName: `aud_${numExpediente.replace(/[^a-zA-Z0-9]/g, '_')}_juicio`,
        observaciones: 'Audiencia de juicio oral y público. Asistencia confirmada.',
      });
      console.log('✅ Audiencia demo programada para hoy.');
    }
  }

  console.log('🎉 Seed judicial completado exitosamente.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
