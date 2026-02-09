# Documentación de la API

Este documento describe los endpoints disponibles en la API RESTful, incluyendo las estructuras de petición (Request) y respuesta (Response).

## 🗂️ Índice de Recursos
1.  [Autenticación (Auth)](#1-autenticación-auth)
2.  [Consultas Médicas](#2-consultas-médicas)
3.  [Evaluaciones](#3-evaluaciones)
4.  [Pacientes](#4-pacientes)
5.  [Usuarios](#5-usuarios)
6.  [Recomendaciones](#6-recomendaciones)
7.  [Parámetros del Sistema](#7-parámetros-del-sistema)
8.  [Cuestionarios](#8-cuestionarios)
9.  [Enfermedades Crónicas](#9-enfermedades-crónicas)
10. [Estructuras Auxiliares](#10-estructuras-auxiliares)

---

## 🏗️ Estructuras Comunes (DTOs)

### `AuthResponse`
Estructura de respuesta al iniciar sesión.
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### `LoginRequest`
```json
{
  "email": "doctor@hospital.com",
  "password": "secretparams"
}
```

### `RegisterRequest`
```json
{
  "nombreCompleto": "Dr. House",
  "cedulaProfesional": "123456789",
  "especialidad": "Psiquiatría",
  "email": "house@hospital.com",
  "password": "strongpassword"
}
```

### `UsuarioDTO`
Representa a un usuario del sistema (Médico/Admin).
```json
{
  "id": "uuid-string",
  "nombreCompleto": "Dr. Strange",
  "cedulaProfesional": "CP123",
  "especialidad": "Neurocirugía",
  "email": "strange@marvel.com",
  "rol": "USUARIO",
  "activo": true,
  "fechaRegistro": "2024-01-01T10:00:00",
  "ultimoAcceso": "2024-01-02T15:30:00"
}
```

### `PacienteDTO`
```json
{
  "id": "uuid-string",
  "cedula": "111222333",
  "nombreEncriptado": "Xy7z...",
  "edad": 35,
  "genero": "Masculino",
  "enfermedadCronica": "Hipertensión",
  "tipoSangre": "O+",
  "alergias": "Penicilina, Mariscos",
  "antecedentesFamiliares": "Diabetes tipo 2 (padre), Hipertensión (madre)",
  "ocupacion": "Ingeniero",
  "activo": true,
  "fechaRegistro": "2024-01-01T10:00:00",
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

### `EvaluacionDTO`
Objeto completo de una evaluación, incluyendo puntajes, niveles y lógica neutrosófica. Puede vincularse opcionalmente a una consulta médica.
```json
{
  "id": "uuid-string",
  "pacienteId": "uuid-paciente",
  "usuarioId": "uuid-medico",
  "consultaId": "uuid-consulta-medica",
  "fechaHora": "2024-01-01T12:00:00",
  "estado": "COMPLETADA",
  "gad7Puntaje": 15,
  "phq9Puntaje": 10,
  "pss10Puntaje": 20,
  "nivelAnsiedad": "Moderado",
  "nivelDepresion": "Leve",
  "nivelEstres": "Moderado",
  "ansiedadT": 0.75,
  "ansiedadI": 0.20,
  "ansiedadF": 0.10,
  "probAdherenciaAlta": 80.5,
  "observaciones": "Paciente presenta mejoría..."
}
```

### `RecomendacionDTO`
```json
{
  "id": "uuid-string",
  "titulo": "Técnica de Respiración",
  "descripcion": "Inhalar 4s, retener 7s, exhalar 8s.",
  "categoria": "Relajación",
  "dimensionAplicable": "Ansiedad",
  "prioridad": 1,
  "esUrgente": false
}
```

### `ParametroSistemaDTO`
```json
{
  "id": "uuid-string",
  "clave": "MAX_LOGIN_ATTEMPTS",
  "valor": "5",
  "tipoDato": "INTEGER",
  "categoria": "Seguridad",
  "editable": true
}
```

---

## 1. Autenticación (`Auth`)
Controlador: `AuthController`
Base Path: `/api/auth`

### `POST /api/auth/login`
Inicia sesión y obtiene un token JWT.
*   **Body**: `LoginRequest`
*   **Response**: `AuthResponse`

### `POST /api/auth/register`
Registra un nuevo usuario (Médico).
*   **Body**: `RegisterRequest`
*   **Response**: `UsuarioDTO`

### `POST /api/auth/forgot-password`
Inicia el proceso de recuperación enviando un código de verificación (OTP) por correo.
*   **Body**: `ForgotPasswordRequest`
*   **Response**: `200 OK`
*   **Request Example**:
    ```json
    {
      "email": "doctor@hospital.com"
    }
    ```
*   **Response Example**:
    ```json
    {
      "message": "Si el correo existe, se ha enviado un código de verificación."
    }
    ```

### `POST /api/auth/validate-otp`
Valida si el código OTP ingresado es correcto y válido.
*   **Body**: `ValidateOtpRequest`
*   **Response**: `200 OK` o `400 Bad Request`
*   **Request Example**:
    ```json
    {
      "email": "doctor@hospital.com",
      "otp": "123456"
    }
    ```
*   **Response Example (Válido)**:
    ```json
    {
      "valid": true,
      "message": "Código válido."
    }
    ```

### `POST /api/auth/reset-password`
Restablece la contraseña utilizando el código OTP validado.
*   **Body**: `ResetPasswordRequest`
*   **Response**: `200 OK`
*   **Request Example**:
    ```json
    {
      "email": "doctor@hospital.com",
      "otp": "123456",
      "newPassword": "newSecretPassword123"
    }
    ```
*   **Response Example**:
    ```json
    {
      "message": "Contraseña restablecida correctamente."
    }
    ```

### `POST /api/auth/change-password`
Cambia la contraseña del usuario autenticado. Requiere el token JWT en el header de autorización.
*   **Headers**: `Authorization: Bearer <token>`
*   **Body**: `ChangePasswordRequest`
*   **Response**: `200 OK` o `400 Bad Request`
*   **Request Example**:
    ```json
    {
      "currentPassword": "contraseñaActual123",
      "newPassword": "nuevaContraseña456"
    }
    ```
*   **Response Example (Éxito)**:
    ```json
    {
      "message": "Contraseña actualizada correctamente."
    }
    ```
*   **Response Example (Error - contraseña incorrecta)**:
    ```json
    {
      "error": "La contraseña actual es incorrecta"
    }
    ```

---

## 2. Consultas Médicas
Controlador: `ConsultaMedicaController`
Base Path: `/api/consultas-medicas`

> [!NOTE]
> Las consultas médicas actúan como puente entre el paciente y la evaluación emocional. Primero se registra la consulta con signos vitales y diagnóstico, luego se vincula opcionalmente a una evaluación psicológica.

### `ConsultaMedicaDTO`
```json
{
  "id": "uuid-string",
  "pacienteId": "uuid-paciente",
  "usuarioId": "uuid-medico",
  "fechaHora": "2024-01-15T10:30:00",
  "presionArterial": "120/80",
  "frecuenciaCardiaca": 72,
  "temperatura": 36.5,
  "saturacionOxigeno": 98,
  "pesoKg": 70.5,
  "tallaCm": 170,
  "motivoConsulta": "Dolor de cabeza recurrente",
  "examenFisico": "Paciente orientado, sin signos de alarma",
  "diagnosticoCie10": "R51",
  "diagnosticoDescripcion": "Cefalea tensional",
  "planTratamiento": "Reposo, hidratación, analgésicos según necesidad"
}
```

### `POST /api/consultas-medicas`
Crea una nueva consulta médica.
*   **Query Params**: `pacienteId` (UUID), `usuarioId` (UUID)
*   **Body**: `ConsultaMedicaDTO`
*   **Response**: `ConsultaMedicaDTO`

### `GET /api/consultas-medicas/{id}`
Obtiene una consulta médica por su ID.
*   **Response**: `ConsultaMedicaDTO`

### `GET /api/consultas-medicas/paciente/{pacienteId}`
Obtiene el historial de consultas de un paciente (ordenado por fecha descendente).
*   **Response**: `List<ConsultaMedicaDTO>`

### `GET /api/consultas-medicas/usuario/{usuarioId}`
Obtiene las consultas realizadas por un médico (ordenado por fecha descendente).
*   **Response**: `List<ConsultaMedicaDTO>`

### `PUT /api/consultas-medicas/{id}`
Actualiza una consulta médica existente.
*   **Body**: `ConsultaMedicaDTO`
*   **Response**: `ConsultaMedicaDTO`

### `DELETE /api/consultas-medicas/{id}`
Elimina una consulta médica.
*   **Response**: `204 No Content`

---

## 3. Evaluaciones
Controlador: `EvaluacionController`
Base Path: `/api/evaluaciones`

> [!NOTE]
> El procesamiento de evaluaciones es asíncrono. Después de enviar respuestas, utilice polling en `/estado` hasta que `completado = true`.

### `POST /api/evaluaciones`
Crea una nueva evaluación psicológica (estado inicial: `en_progreso`).
*   **Body**: `EvaluacionDTO`
*   **Response**: `EvaluacionDTO`

### `POST /api/evaluaciones/{id}/respuestas`
Envía las respuestas de los cuestionarios e inicia el procesamiento asíncrono.
*   **Body**: `RespuestasEvaluacionDTO`
*   **Response**: `EstadoEvaluacionDTO` (HTTP 202 Accepted)

```json
// Request Body
{
  "gad7": [{ "numeroItem": 1, "respuesta": 2 }, ...],  // 7 items (0-3)
  "phq9": [{ "numeroItem": 1, "respuesta": 1 }, ...],  // 9 items (0-3)
  "pss10": [{ "numeroItem": 1, "respuesta": 3 }, ...]  // 10 items (0-4)
}
```

### `GET /api/evaluaciones/{id}/respuestas`
Obtiene las respuestas enviadas para una evaluación.
*   **Response**: `RespuestasEvaluacionDTO`

### `GET /api/evaluaciones/{id}/estado`
Consulta el estado del procesamiento (para polling).
*   **Response**: `EstadoEvaluacionDTO`

```json
{
  "evaluacionId": "uuid",
  "estado": "procesando|completada|error",
  "progreso": 50,
  "completado": false,
  "mensaje": "Procesamiento en curso...",
  "resultadosUrl": "/api/evaluaciones/uuid/resultados"
}
```

### `GET /api/evaluaciones/{id}/resultados`
Obtiene los resultados completos (solo cuando `estado = completada`).
*   **Response**: `ResultadosEvaluacionDTO`

### `GET /api/evaluaciones/{id}`
Obtiene una evaluación por su ID.
*   **Response**: `EvaluacionDTO`

### `GET /api/evaluaciones/paciente/{pacienteId}`
Historial de evaluaciones de un paciente.
*   **Response**: `List<EvaluacionDTO>`

### `GET /api/evaluaciones/usuario/{usuarioId}`
Evaluaciones realizadas por un profesional.
*   **Response**: `List<EvaluacionDTO>`

---

## 3. Pacientes
Controlador: `PacienteController`
Base Path: `/api/pacientes`

> [!NOTE]
> Los pacientes ya no tienen un `usuario_id` directo. La relación médico-paciente se gestiona a través de la tabla `relacion_usuario_paciente`.

### `GET /api/pacientes`
Lista todos los pacientes del sistema.
*   **Response**: `List<PacienteDTO>`

### `POST /api/pacientes`
Registra un nuevo paciente y crea la relación con el médico.
*   **Query Params**: `usuarioId` (UUID) - ID del médico que registra
*   **Body**: `PacienteDTO`
*   **Response**: `PacienteDTO`

### `POST /api/pacientes/asociar`
Asocia un paciente existente a un médico (útil para referidos).
*   **Query Params**: `pacienteId` (UUID), `usuarioId` (UUID)
*   **Response**: `RelacionUsuarioPacienteDTO`

### `POST /api/pacientes/desasociar`
Desasocia un paciente de un médico (desactiva la relación).
*   **Query Params**: `pacienteId` (UUID), `usuarioId` (UUID)
*   **Response**: `204 No Content`

### `GET /api/pacientes/{id}`
Obtiene la información de un paciente.
*   **Response**: `PacienteDTO`

### `GET /api/pacientes/cedula/{cedula}`
Busca un paciente por su número de cédula.
*   **Response**: `PacienteDTO`

### `GET /api/pacientes/usuario/{usuarioId}`
Lista todos los pacientes asociados a un médico (usa tabla de relación).
*   **Response**: `List<PacienteDTO>`

### `DELETE /api/pacientes/{id}`
Elimina un paciente.
*   **Response**: `204 No Content`

### `PUT /api/pacientes/{id}`
Actualiza la información de un paciente.
*   **Body**: `PacienteDTO`
*   **Response**: `PacienteDTO`

---

## 9. Enfermedades Crónicas
Controlador: `EnfermedadCronicaController`
Base Path: `/api/enfermedades-cronicas`

### `GET /api/enfermedades-cronicas`
Lista todas las enfermedades crónicas.
*   **Response**: `List<EnfermedadCronicaDTO>`

### `GET /api/enfermedades-cronicas/{id}`
Obtiene una enfermedad crónica por ID.
*   **Response**: `EnfermedadCronicaDTO`

### `POST /api/enfermedades-cronicas`
Crea una nueva enfermedad crónica.
*   **Body**: `EnfermedadCronicaDTO`
*   **Response**: `EnfermedadCronicaDTO`

### `PUT /api/enfermedades-cronicas/{id}`
Actualiza una enfermedad crónica existente.
*   **Body**: `EnfermedadCronicaDTO`
*   **Response**: `EnfermedadCronicaDTO`

### `DELETE /api/enfermedades-cronicas/{id}`
Elimina una enfermedad crónica.
*   **Response**: `204 No Content`

---

## 4. Usuarios
Controlador: `UsuarioController`
Base Path: `/api/usuarios`

### `POST /api/usuarios/admin`
Crea un usuario con rol de ADMIN.
*   **Requires**: Rol `ADMIN` (PreAuthorize).
*   **Body**: `UsuarioDTO`
*   **Response**: `UsuarioDTO`

### `GET /api/usuarios/{id}`
Obtiene el perfil de un usuario.
*   **Response**: `UsuarioDTO`

---

## 5. Recomendaciones
Controlador: `RecomendacionController`
Base Path: `/api/recomendaciones`

### `GET /api/recomendaciones`
Lista todas las recomendaciones disponibles.
*   **Response**: `List<RecomendacionDTO>`

### `GET /api/recomendaciones/dimension/{dimension}`
Filtra recomendaciones por dimensión (ej. "Ansiedad", "Depresion").
*   **Response**: `List<RecomendacionDTO>`

### `GET /api/recomendaciones/{id}`
Obtiene una recomendación específica.
*   **Response**: `RecomendacionDTO`

### `POST /api/recomendaciones`
Crea una nueva recomendación en el banco de datos.
*   **Body**: `RecomendacionDTO`
*   **Response**: `RecomendacionDTO`

---

## 6. Parámetros del Sistema
Controlador: `ParametroSistemaController`
Base Path: `/api/parametros-sistema`
**Nota**: Todos estos endpoints requieren rol `ADMIN`.

### `GET /api/parametros-sistema`
Lista todas las configuraciones del sistema.
*   **Response**: `List<ParametroSistemaDTO>`

### `GET /api/parametros-sistema/{id}`
Obtiene un parámetro por ID.
*   **Response**: `ParametroSistemaDTO`

### `GET /api/parametros-sistema/clave/{clave}`
Obtiene un parámetro por su clave única (ej. "JWT_EXPIRATION").
*   **Response**: `ParametroSistemaDTO`

### `POST /api/parametros-sistema`
Crea un nuevo parámetro.
*   **Body**: `ParametroSistemaDTO`
*   **Response**: `ParametroSistemaDTO`

### `PUT /api/parametros-sistema/{id}`
Actualiza un parámetro existente.
*   **Body**: `ParametroSistemaDTO`
*   **Response**: `ParametroSistemaDTO`

### `DELETE /api/parametros-sistema/{id}`
Elimina un parámetro.
*   **Response**: `204 No Content`

---

## 7. Cuestionarios
Controlador: `CuestionarioController`
Base Path: `/api/cuestionarios`

### `GET /api/cuestionarios`
Obtiene todos los cuestionarios activos agrupados por tipo (GAD7, PHQ9, PSS10).
*   **Response**: `List<CuestionarioAgrupadoDTO>`

### `CuestionarioAgrupadoDTO`
```json
[
  {
    "tipo": "GAD7",
    "preguntas": [
      { "id": 1, "texto": "¿Se ha sentido nervioso(a)...", "numero": 1, "esInversa": false, "esCritica": false }
    ]
  },
  {
    "tipo": "PHQ9",
    "preguntas": [...]
  }
]
```

---

## 8. Estructuras Auxiliares

### `RelacionUsuarioPacienteDTO`
Estructura utilizada en las respuestas de asociar/desasociar pacientes.
```json
{
  "id": 1,
  "usuarioId": "uuid-doctor",
  "pacienteId": "uuid-paciente",
  "fechaRelacion": "2024-01-01T10:00:00",
  "activo": true,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

> [!NOTE]
> Los endpoints para gestionar relaciones usuario-paciente están en `/api/pacientes` (asociar, desasociar).
