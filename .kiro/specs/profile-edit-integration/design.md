# Diseño de Integración de Edición de Perfil

## Overview

El diseño integra la funcionalidad de edición de perfil directamente en la página `/profile`, creando una experiencia de usuario fluida donde los usuarios pueden alternar entre modo de visualización y edición sin cambiar de página. Se aprovechará el componente `ProfileEdit.jsx` existente y se modificará la página `ProfilePage.jsx` para incluir ambas funcionalidades.

## Architecture

### Componente Principal
- **ProfilePage.jsx**: Componente principal que maneja tanto la visualización como la edición
- **Modo Toggle**: Estado que alterna entre vista (`view`) y edición (`edit`)
- **Estado Compartido**: Datos del usuario y estado de edición compartidos

### Flujo de Datos
```
Usuario → ProfilePage → [Modo View | Modo Edit] → API → Actualización Contexto → UI
```

### Estados de la Aplicación
1. **Loading**: Cargando datos del usuario
2. **View Mode**: Mostrando información del perfil
3. **Edit Mode**: Permitiendo edición de datos
4. **Saving**: Guardando cambios
5. **Error**: Mostrando errores de validación o servidor

## Components and Interfaces

### ProfilePage Component
```jsx
interface ProfilePageProps {
  // No props externos, usa useAuth() para obtener usuario
}

interface ProfilePageState {
  mode: 'view' | 'edit'
  formData: UserFormData
  loading: boolean
  saving: boolean
  errors: ValidationErrors
  showConfirmDialog: boolean
  avatarFile: File | null
  avatarPreview: string | null
}
```

### UserFormData Interface
```jsx
interface UserFormData {
  nombre: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
```

### Componentes Reutilizables
- **ProfileViewSection**: Muestra información en modo lectura
- **ProfileEditSection**: Formulario de edición (extraído de ProfileEdit.jsx)
- **AvatarUpload**: Componente para manejo de avatar
- **PasswordChangeSection**: Sección específica para cambio de contraseña

## Data Models

### User Model (Frontend)
```jsx
interface User {
  id: number
  nombre: string
  email: string
  rol: 'cliente' | 'admin' | 'super_admin'
  avatar?: string
  date_register: string
  is_active: boolean
}
```

### API Request/Response Models
```jsx
// PUT /api/users/profile
interface UpdateProfileRequest {
  nombre: string
  email: string
  currentPassword?: string
  newPassword?: string
  avatar?: File
}

interface UpdateProfileResponse {
  success: boolean
  message: string
  user: User
}
```

## Error Handling

### Tipos de Errores
1. **Validación Frontend**: Campos vacíos, formato de email, contraseñas no coinciden
2. **Validación Backend**: Email duplicado, contraseña actual incorrecta
3. **Errores de Red**: Conexión perdida, timeout
4. **Errores de Archivo**: Imagen muy grande, formato no soportado

### Estrategia de Manejo
- **Validación en Tiempo Real**: Validar campos mientras el usuario escribe
- **Mensajes Específicos**: Mostrar errores claros y accionables
- **Recuperación Graceful**: Permitir reintentos y mantener datos del formulario
- **Rollback**: Restaurar estado anterior en caso de error

## Testing Strategy

### Unit Tests
- Validación de formularios
- Manejo de estados
- Transformación de datos
- Componentes individuales

### Integration Tests
- Flujo completo de edición
- Subida de avatar
- Cambio de contraseña
- Integración con AuthContext

### E2E Tests
- Navegación a perfil
- Edición exitosa de datos
- Manejo de errores
- Responsive design

### Test Cases Específicos
1. **Edición Básica**: Cambiar nombre y email
2. **Cambio de Contraseña**: Flujo completo con validaciones
3. **Subida de Avatar**: Diferentes formatos y tamaños
4. **Validaciones**: Todos los casos de error
5. **Cancelación**: Restaurar datos originales
6. **Responsive**: Funcionalidad en móvil y desktop

## UI/UX Design

### Modo Visualización
- **Layout**: Card con información del usuario
- **Avatar**: Circular, centrado, con placeholder si no hay imagen
- **Información**: Nombre, email, fecha de registro
- **Acción**: Botón "Editar Perfil" prominente

### Modo Edición
- **Transición**: Animación suave entre modos
- **Formulario**: Campos organizados en grid responsive
- **Avatar**: Preview en tiempo real con botón de cambio
- **Contraseña**: Sección colapsable opcional
- **Acciones**: Botones "Guardar" y "Cancelar" claramente diferenciados

### Estados Visuales
- **Loading**: Skeleton loaders para mejor UX
- **Saving**: Botones deshabilitados con spinner
- **Error**: Campos resaltados con mensajes específicos
- **Success**: Snackbar con confirmación

### Responsive Considerations
- **Mobile First**: Diseño optimizado para móvil
- **Breakpoints**: sm (600px), md (900px), lg (1200px)
- **Touch Targets**: Mínimo 44px para elementos interactivos
- **Typography**: Escalas apropiadas para cada dispositivo

## Implementation Notes

### Reutilización de Código
- Extraer lógica de `ProfileEdit.jsx` en hooks personalizados
- Crear componentes reutilizables para formularios
- Mantener consistencia con el sistema de diseño existente

### Performance
- Lazy loading de componentes pesados
- Debounce en validaciones en tiempo real
- Optimización de re-renders con React.memo

### Accessibility
- Labels apropiados para screen readers
- Navegación por teclado
- Contraste de colores adecuado
- Mensajes de error asociados a campos

### Security
- Validación tanto en frontend como backend
- Sanitización de datos de entrada
- Manejo seguro de archivos subidos
- Tokens de autenticación en todas las requests