export const environment = {
  production: true,
  apiUrl: 'https://tesis2026-ahaygaa3eyd9bfch.brazilsouth-01.azurewebsites.net',
  endpoints: {
    // Auth
    login: '/api/auth/login',
    register: '/api/auth/register',

    // Usuarios
    usuarios: '/api/usuarios',

    // Pacientes
    pacientes: '/api/pacientes',

    // Evaluaciones
    evaluaciones: '/api/evaluaciones',

    // Cuestionarios
    cuestionarios: '/api/cuestionarios',

    // Recomendaciones
    recomendaciones: '/api/recomendaciones',

    // Parámetros del sistema (admin)
    parametrosSistema: '/api/parametros-sistema',

    // Relaciones Usuario-Paciente
    relacionesUsuarioPaciente: '/api/relaciones-usuario-paciente',

    // Enfermedades Crónicas
    enfermedadesCronicas: '/api/enfermedades-cronicas',
  },
};
