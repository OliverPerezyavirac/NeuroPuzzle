# Puzzles Collection - Extensión de Navegador

Una extensión de navegador que ofrece una colección de puzzles interactivos y divertidos.

## Características

- Múltiples tipos de puzzles
- Interfaz intuitiva y amigable
- Diseño responsive
- Fácil de usar

## Instalación

1. Clona este repositorio
2. Abre tu navegador (Chrome, Firefox, o Edge)
3. Ve a la página de extensiones
4. Activa el "Modo desarrollador"
5. Selecciona "Cargar extensión descomprimida"
6. Selecciona la carpeta del proyecto

## Estructura del Proyecto

```
puzzles/
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── images/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Desarrollo

Para agregar un nuevo puzzle:

1. Crear una nueva carpeta en `puzzles/` con el nombre del puzzle
2. Agregar la lógica del puzzle en un archivo JavaScript
3. Registrar el puzzle en `popup.js`
4. Agregar la miniatura en la carpeta `images/`

## Próximas Características

- Más tipos de puzzles
- Sistema de puntuación
- Guardado de progreso
- Niveles de dificultad

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir cambios o mejoras. 