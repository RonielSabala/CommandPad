import { DocsSectionId } from "@/common/constants/docs";
import { BlockType, NoteStyle } from "@/common/enums";
import { KeyBinding } from "@/common/keybindings";
import type { Messages } from "../types";

export const es: Messages = {
  common: {
    cancel: "Cancelar",
    close: "Cerrar",
    ok: "Aceptar",
    create: "Crear",
    dragToReorder: "Arrastra para reordenar",
    clearSearch: "Limpiar búsqueda",
    noMatches: "Sin coincidencias.",
    untitledTab: "Sin título",
    untitledRunbook: "Libro sin título",
  },
  header: {
    reloadTitle: "Recargar CommandPad",
    switchToEdit: "Cambiar a modo edición",
    switchToRead: "Cambiar a modo lectura",
    switchToDark: "Cambiar a modo oscuro",
    switchToLight: "Cambiar a modo claro",
    collapseAll: "Contraer todo",
    toggleEditorsTitle: "Expandir/contraer todos los editores de comandos",
    keybindingsTitle: "Atajos de teclado",
    resetWorkspaceTitle: "Resetear espacio de trabajo",
    exportTitle: "Exportar libro",
    export: "Exportar",
    changeLanguage: "Cambiar idioma",
  },
  sidebar: {
    expand: "Expandir barra lateral",
    collapse: "Contraer barra lateral",
    moveLeft: "Mover barra lateral a la izquierda",
    moveRight: "Mover barra lateral a la derecha",
    doubleClickExpand: "Doble clic para expandir",
    dragResizeCollapse:
      "Arrastra para redimensionar · doble clic para contraer",
  },
  runbooks: {
    title: "LIBROS",
    searchPlaceholder: "Buscar libros…",
    empty: "No hay libros importados.",
    import: "Importar",
    importTitle: "Importar libro",
    paste: "Pegar",
    pasteTitle: "Pegar JSON de libro",
    removeFromLibrary: "Quitar de la biblioteca",
  },
  variables: {
    title: "VARIABLES",
    searchPlaceholder: "Buscar variables…",
    empty: "No hay variables definidas.",
    new: "Nueva",
    newTitle: "Nueva variable",
    keyPlaceholder: "clave",
    valuePlaceholder: "valor",
    reveal: "Mostrar valor",
    mask: "Ocultar valor",
    remove: "Eliminar variable",
    unusedTitle: (key) => `${key} (sin usar)`,
  },
  tabs: {
    newTab: "Nueva pestaña",
    closeTab: "Cerrar pestaña",
  },
  blocks: {
    newBlockLabel: "NUEVO BLOQUE",
    typeLabel: {
      [BlockType.COMMAND]: "Comando",
      [BlockType.NOTE]: "Nota",
      [BlockType.DIVIDER]: "Divisor",
    },
    typeTitle: (label) => `Bloque de ${label.toLowerCase()}`,
    duplicate: "Duplicar bloque",
    delete: "Eliminar bloque",
    emptyTitle: "Aún no hay bloques.",
    emptyHint: "Agrega un comando o una nota abajo.",
  },
  command: {
    emptyPreview: "comando vacío",
    showEditor: "Mostrar editor",
    hideEditor: "Ocultar editor",
    copy: "Copiar comando",
    placeholder: "ssh {USUARIO}@{HOST}",
  },
  note: {
    styleLabel: {
      [NoteStyle.HEADING]: "título",
      [NoteStyle.SUBHEADING]: "subtítulo",
      [NoteStyle.BODY]: "cuerpo",
    },
    stylePlaceholder: {
      [NoteStyle.HEADING]: "Sección de título...",
      [NoteStyle.SUBHEADING]: "Sección de subtítulo...",
      [NoteStyle.BODY]: "Sección de cuerpo...",
    },
  },
  exportModal: {
    title: "Exportar",
    message: "Elige un formato de exportación.",
  },
  pasteModal: {
    title: "Pegar Libro",
    message: "Pega el JSON del libro para crear uno nuevo.",
    error: "Eso no parece un JSON de libro válido.",
  },
  keybindingsModal: {
    title: "Atajos de Teclado",
  },
  alert: {
    invalidFormatTitle: "Formato Inválido",
  },
  confirm: {
    defaultTitle: "Confirmar",
  },
  dialogs: {
    overwriteTitle: "Sobrescribir Libro",
    overwriteConfirm: "Sobrescribir",
    overwriteMessage: (filename, existingName) =>
      `"${filename}" coincide con un libro existente. Importarlo sobrescribirá "${existingName}".`,
    importFailed: (count) =>
      count === 1
        ? "No se pudo importar 1 archivo porque su formato no se reconoce."
        : `No se pudieron importar ${count} archivos porque sus formatos no se reconocen.`,
    pastedRunbook: "Libro pegado",
    resetTitle: "Resetear Espacio de Trabajo",
    resetConfirm: "Resetear",
    resetMessage:
      "¿Eliminar todas las variables, bloques, libros y preferencias? Esta acción no se puede deshacer.",
  },
  keybindings: {
    [KeyBinding.TOGGLE_MODE]: "Alternar modo lectura / edición",
    [KeyBinding.NEW_TAB]: "Abrir una nueva pestaña",
    [KeyBinding.CLOSE_TAB]: "Cerrar la pestaña activa",
    [KeyBinding.TOGGLE_EDITORS]: "Alternar todos los editores de comandos",
    [KeyBinding.DELETE_RUNBOOK]: "Eliminar el libro enfocado de la biblioteca",
    [KeyBinding.IMPORT_RUNBOOK]: "Abrir el diálogo de importación de libro",
    [KeyBinding.TOGGLE_SIDEBAR]: "Contraer / expandir barra lateral",
    [KeyBinding.MOVE_SIDEBAR]: "Mover barra lateral a izquierda / derecha",
    [KeyBinding.DUPLICATE_BLOCK]: "Duplicar bloques seleccionados",
    [KeyBinding.DELETE_BLOCK]: "Eliminar bloques seleccionados",
    [KeyBinding.ESCAPE]: "Limpiar selección de bloques / cerrar diálogos",
    [KeyBinding.EXPORT]: "Abrir el diálogo de exportación",
    [KeyBinding.RESET_WORKSPACE]:
      "Abrir el diálogo de resetear espacio de trabajo",
    [KeyBinding.FOCUS_RUNBOOK]: "Seleccionar libro activo",
    [KeyBinding.NAVIGATE_RUNBOOKS]:
      "Navegar libros con el libro activo seleccionado",
    [KeyBinding.OPEN_LINK]: "Abrir enlace de nota en una pestaña nueva",
    [KeyBinding.MULTISELECT_BLOCKS]: "Selección múltiple de bloques",
    [KeyBinding.NOTE_BOLD]:
      "Poner en negrita el texto seleccionado (bloque de nota)",
    [KeyBinding.NOTE_ITALIC]:
      "Poner en cursiva el texto seleccionado (bloque de nota)",
    [KeyBinding.NOTE_CODE]:
      "Envolver el texto seleccionado en comillas invertidas (bloque de nota)",
  },
  docs: {
    meta: {
      title: "Documentación",
      openDocs: "Abrir documentación",
      backToApp: "Volver a la app",
      tocTitle: "Contenido",
    },
    toc: {
      [DocsSectionId.GETTING_STARTED]: "Primeros pasos",
      [DocsSectionId.WORKSPACE]: "Espacio de trabajo",
      [DocsSectionId.TABS]: "Pestañas",
      [DocsSectionId.SIDEBAR]: "Barra lateral",
      [DocsSectionId.RUNBOOK_LIBRARY]: "Biblioteca de libros",
      [DocsSectionId.VARIABLES]: "Variables",
      [DocsSectionId.VARIABLE_REFERENCES]: "Referencias de variables",
      [DocsSectionId.PARAMETERIZED_PLACEHOLDERS]:
        "Marcadores parametrizados",
      [DocsSectionId.ESCAPING_BRACES]: "Escapar llaves",
      [DocsSectionId.SECRET_VARIABLES]: "Variables secretas",
      [DocsSectionId.BLOCKS]: "Bloques",
      [DocsSectionId.COMMAND_BLOCK]: "Bloque de comando",
      [DocsSectionId.NOTE_BLOCK]: "Bloque de nota",
      [DocsSectionId.DIVIDER_BLOCK]: "Bloque divisor",
      [DocsSectionId.MULTI_SELECT]: "Selección múltiple",
      [DocsSectionId.READ_MODE]: "Modo lectura",
      [DocsSectionId.EXPORT]: "Exportar",
      [DocsSectionId.LANGUAGE]: "Idioma",
      [DocsSectionId.KEYBOARD_SHORTCUTS]: "Atajos de teclado",
    },
    demo: {
      tryIt: "Pruébalo",
      noteSample:
        "Haz clic en esta nota para ver su texto en bruto: mezcla **negrita**, _cursiva_, `código` y un enlace a https://example.com. Haz clic fuera para verla renderizada de nuevo.",
    },
    gettingStarted: {
      intro:
        "Bienvenido a CommandPad. Aquí construyes **libros de comandos**: documentos que mezclan los comandos que ejecutas una y otra vez con las notas que los explican, mientras las **variables** rellenan las partes que cambian entre entornos, credenciales u objetivos.",
      journey:
        "Esta guía recorre la app en el mismo orden en que la descubrirías de forma natural. Empiezas en el espacio de trabajo y su barra lateral, luego conoces los tres tipos de bloque con los que se construye todo libro, y después las variables, la característica que hace realmente potentes a los bloques de comando. A continuación vienen las pestañas, la edición en bloque con selección múltiple y la biblioteca donde vive tu trabajo. Las secciones finales cubren el modo lectura, la exportación, los idiomas y todos los atajos de teclado. La mayoría de secciones incluye un ejemplo en vivo marcado como **Pruébalo**: son piezas reales e interactivas de la app, así que experimenta con libertad, nada de lo que hagas en ellas toca tu espacio de trabajo real.",
      outcomesLead: "Al terminar esta guía sabrás cómo:",
      outcomes: [
        "Construir un libro con bloques de comando, notas y divisores.",
        "Definir una variable una vez y reutilizarla en cualquier comando, incluidos secretos que permanecen ocultos.",
        "Copiar comandos totalmente resueltos con un clic.",
        "Organizar libros en pestañas y reordenar cualquier cosa arrastrando.",
        "Importar, guardar y exportar libros desde la biblioteca.",
        "Bloquearlo todo con el modo lectura cuando toca ejecutar, no editar.",
      ],
    },
    workspace: {
      intro:
        "El espacio de trabajo es la pantalla principal de la app: una cabecera con acciones globales, una barra lateral con la biblioteca de libros y el panel de variables, y el panel principal donde viven los bloques del libro activo.",
    },
    tabs: {
      intro: "Cada pestaña contiene un libro abierto.",
      items: [
        "Haz clic en una pestaña para cambiar a ella.",
        "**Clic con la rueda** en una pestaña para cerrarla.",
        "**Arrastra** una pestaña para reordenarla.",
        "**Suelta bloques sobre una pestaña** para copiarlos dentro de ella.",
        "Una barra de acento en la parte inferior marca la pestaña activa de un vistazo.",
      ],
    },
    sidebar: {
      intro:
        "La barra lateral contiene la biblioteca de libros y el panel de variables.",
      items: [
        "**Contraer / expandir**: haz clic en el botón de flecha o usa el atajo de la barra lateral.",
        "**Mover a izquierda / derecha**: haz clic en el botón de disposición para mover la barra lateral al otro lado de la pantalla.",
        "**Redimensionar**: arrastra el borde interior de la barra lateral; doble clic para contraerla.",
      ],
    },
    runbookLibrary: {
      intro:
        "La sección **LIBROS** de la barra lateral contiene tus libros importados.",
      items: [
        "Haz clic en **Importar** para cargar uno o varios archivos `.json` a la vez, o en **Pegar** para crear un libro desde JSON en bruto.",
        "Haz clic en cualquier entrada para abrirla. Si ya está abierta en una pestaña, esa pestaña pasa a estar activa.",
        "Elimina un libro de la biblioteca con el botón que aparece al pasar el cursor sobre la fila.",
        "Arrastra el control a la izquierda de una entrada para reordenar la lista.",
        "Usa la **barra de búsqueda** para filtrar libros por nombre.",
      ],
      autoLabel:
        "**Etiquetado automático:** si el primer bloque de un libro es una nota, su texto se usa como etiqueta en la biblioteca, de modo que las entradas se describen solas. En caso contrario se usa el nombre del archivo importado.",
      autoSave:
        "Los cambios hechos al libro activo se guardan automáticamente en su entrada de la biblioteca.",
    },
    variables: {
      intro:
        "Las variables se definen en la sección **VARIABLES** de la barra lateral. Cada variable tiene una **clave** y un **valor**. Las claves distinguen mayúsculas de minúsculas, y las variables con clave vacía se ignoran.",
      usage:
        "Referencia una variable en cualquier bloque de comando envolviendo su clave en llaves, p. ej. `{NAMESPACE}`. Renombrar una clave actualiza automáticamente todas las referencias, y las variables que ningún comando referencia se atenúan para detectar entradas obsoletas fácilmente.",
    },
    variableReferences: {
      intro:
        "El valor de una variable puede referenciar otras variables. Las referencias se resuelven recursivamente, así que puedes construir valores como `https://{HOST}/api` a partir de piezas más pequeñas.",
    },
    parameterizedPlaceholders: {
      intro:
        "El valor de una variable puede contener un marcador `{;nombre}` que no se rellena hasta que la variable es referenciada.",
      fill:
        "Rellénalo por referencia con `{clave;nombre=valor}`. Proporciona varios marcadores separándolos con `;`, p. ej. `{A;p1=v1;p2=v2}`.",
      unresolved:
        "Si una referencia omite el valor de un marcador, el marcador `{;nombre}` se deja en su lugar y el comando se considera sin resolver.",
    },
    escapingBraces: {
      intro:
        "Antepón una barra invertida a `{` o `}` en un bloque de comando para mostrar la llave literalmente en vez de iniciar una referencia de variable. La barra invertida se elimina del comando resuelto.",
      scope:
        "El escape aplica solo a bloques de comando; las barras invertidas dentro de valores de variables son siempre literales. También funciona dentro del valor de un parámetro, para pasar una llave literal en lugar de una referencia anidada.",
    },
    secretVariables: {
      intro:
        "Haz clic en el **icono de ojo** de una fila de variable para marcarla como **secreta**. Los valores secretos se ocultan en la barra lateral y se sustituyen silenciosamente en las vistas previas de comandos.",
    },
    blocks: {
      intro:
        "Los bloques son el contenido principal de un libro. Agrégalos con la fila **NUEVO BLOQUE** al final del panel principal.",
      tip:
        "Si no hay pestañas abiertas y agregas un bloque (o creas una variable), se crea automáticamente una pestaña sin título.",
    },
    commandBlock: {
      intro: "Un bloque de comando tiene dos partes:",
      preview:
        "**Vista previa** (siempre visible): el comando totalmente resuelto. Las referencias sin resolver se resaltan. Haz clic en **Copiar** para copiar el texto resuelto al portapapeles.",
      editor:
        "**Editor** (contraíble): la plantilla del comando en bruto, con el prefijo `$`. Usa el botón de flecha para contraerlo, o alterna todos los editores globalmente con el botón de la cabecera.",
      multiline:
        "Los comandos pueden ocupar varias líneas. El editor se desplaza horizontalmente cuando una línea excede el ancho del panel.",
      gutterNote:
        "El margen izquierdo marca la primera línea con `$` y numera cada línea adicional, como en el ejemplo de abajo. Prueba a agregar una línea para ver crecer la numeración.",
    },
    noteBlock: {
      intro:
        "Un bloque de texto libre. Los bloques de nota se expanden horizontal y verticalmente mientras escribes.",
      styles:
        "Hay tres estilos de texto seleccionables al pasar el cursor: **título** (grande, en negrita), **subtítulo** (mediano, acentuado) y **cuerpo** (prosa por defecto).",
      markdown: "Las notas soportan markdown en línea:",
      tableSyntax: "Sintaxis",
      tableResult: "Resultado",
      links:
        "Para abrir un enlace, mantén `Ctrl` y haz clic en él. En modo lectura, los enlaces se pueden abrir con un clic directo.",
      wrapKeys:
        "Con texto seleccionado en una nota, `Ctrl+B` lo envuelve en negrita, `Ctrl+I` en cursiva y **Ctrl+´** en comillas invertidas; escribir **(**, **[** o **{** lo envuelve en ese par de corchetes.",
    },
    dividerBlock: {
      intro:
        "Un separador visual. Se estira hasta igualar el ancho del bloque más ancho, lo que lo hace perfecto para dividir un libro en secciones visuales.",
    },
    multiSelect: {
      intro:
        "Mantén `Shift` y haz clic en bloques para construir una selección. También puedes mantener `Shift` y arrastrar el ratón sobre los bloques para seleccionarlos con un lazo. Lazar bloques ya seleccionados los deselecciona.",
      actions: [
        "**Arrastra** el control de cualquier bloque seleccionado para mover todos los bloques seleccionados juntos, conservando el orden relativo.",
        "**Copiar a otra pestaña**: arrastra el control de cualquier bloque seleccionado sobre una pestaña para copiar toda la selección dentro de ella.",
        "**Duplicar**: `Ctrl+D` duplica el grupo completo, insertado después del último bloque seleccionado.",
        "**Eliminar**: `Supr` elimina el grupo completo.",
      ],
      clear:
        "Pulsa `Escape` o haz clic fuera de los controles de bloque para limpiar la selección.",
    },
    readMode: {
      intro:
        "El modo lectura bloquea la edición, no la navegación. Haz clic en el **icono de candado** de la cabecera para activarlo:",
      rules: [
        "Todos los editores de comandos se contraen y no pueden expandirse.",
        "El texto de bloques y notas no puede editarse.",
        "La estructura de bloques no puede cambiarse (sin agregar, eliminar ni reordenar).",
        "Los valores de las variables sí pueden cambiarse.",
        "Los libros sí pueden cambiarse.",
        "Los enlaces en notas se abren con un clic directo.",
      ],
      exit: "Haz clic en el **icono de lápiz** para volver al modo edición.",
    },
    export: {
      intro:
        "Haz clic en **Exportar** en la cabecera para abrir el selector de formato.",
      formats: [
        "**JSON**: el espacio de trabajo completo (variables + bloques). Puede reimportarse.",
        "**Markdown**: un archivo `.md` legible con títulos, subtítulos, divisores y comandos resueltos.",
        "**Texto plano**: el mismo contenido que Markdown, guardado como `.txt`.",
      ],
      saveDialog:
        "En navegadores compatibles se abre un diálogo nativo de guardado para elegir nombre y carpeta. En los demás, el archivo se descarga directamente.",
    },
    language: {
      intro:
        "Usa el **selector de idioma** de la cabecera para elegir el idioma de la interfaz. Actualmente están disponibles English y Español.",
      detection:
        "La app detecta el idioma de tu navegador en la primera visita, y tu elección se recuerda después.",
    },
    keyboardShortcuts: {
      intro:
        "Estos atajos también están disponibles en la app en cualquier momento mediante el **icono de teclado** de la cabecera.",
    },
  },
};
