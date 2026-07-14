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
      [DocsSectionId.HEADER]: "Cabecera",
      [DocsSectionId.TABS]: "Pestañas",
      [DocsSectionId.SIDEBAR]: "Barra lateral",
      [DocsSectionId.MAIN_PANEL]: "Panel principal",
      [DocsSectionId.RUNBOOK_LIBRARY]: "Biblioteca de libros",
      [DocsSectionId.VARIABLES]: "Variables",
      [DocsSectionId.VARIABLE_REFERENCES]: "Referencias de variables",
      [DocsSectionId.PARAMETERIZED_PLACEHOLDERS]: "Marcadores parametrizados",
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
      [DocsSectionId.QA]: "Preguntas y respuestas",
    },
    demo: {
      tryIt: "Pruébalo",
      reset: "Reiniciar demo",
      tabSamples: ["Checklist de despliegue", "Respaldo de base de datos", ""],
      runbookSamples: [
        "Checklist de release",
        "Respaldo de Postgres",
        "Depuración de K8s",
      ],
      multiSelectNotes: ["**Levantar el stack**", "**Apagarlo todo**"],
      noteSample:
        "Haz clic en esta nota para ver su texto en bruto: mezcla **negrita**, _cursiva_, `código` y un enlace, p. ej. https://example.com. Haz clic fuera para verla renderizada de nuevo.",
    },
    gettingStarted: {
      intro:
        "Bienvenido a CommandPad. Aquí construyes **libros de comandos**: documentos que mezclan los comandos que ejecutas a menudo con las notas que ayudan a explicarlos.",
      journey:
        "Esta guía te ayudará a entender cómo funciona la aplicación para que le saques todo el provecho. Comenzarás aprendiendo sobre el espacio de trabajo y su barra lateral, luego conocerás los tres tipos de bloques con los que construirás tus libros de comandos y, para terminar, las variables: la característica que hace que los bloques de comando sean realmente potentes.",
      navigate:
        "Puedes leerla de principio a fin o saltar directo a lo que te interese desde el índice de la izquierda: tú eliges el ritmo.",
      tryIt:
        "Y no te quedes solo leyendo: la mayoría de las secciones trae un ejemplo interactivo marcado **Pruébalo**, una pieza real de la app donde puedes jugar sin miedo, nada de lo que hagas ahí toca tu espacio de trabajo real. Aquí se aprende haciendo. Si te pierdes, el botón de flecha en su esquina te devuelve al punto de partida.",
    },
    workspace: {
      intro:
        "El espacio de trabajo es la pantalla principal de la app. Aquí es donde pasarás la mayor parte del tiempo armando y puliendo tus libros. Está formado por tres zonas:",
      items: [
        "La **cabecera**: reúne los botones con las acciones globales de la app.",
        "La **barra lateral**: contiene la biblioteca de libros y el panel de variables.",
        "El **panel principal**: aquí viven todos los libros que tengas abiertos y, dentro de ellos, sus bloques.",
      ],
      persistence:
        "Todo lo que haces se guarda automáticamente en tu navegador y se restaura al recargar la página. Tus datos nunca se envían a un servidor.",
    },
    header: {
      intro:
        "La cabecera reúne las acciones que afectan a toda la app. De izquierda a derecha:",
      items: [
        "El **logo de CommandPad**: haz clic en él para recargar la app.",
        "El **candado / lápiz**: alterna entre el modo lectura y el modo edición. Tiene su propia sección más adelante.",
        "**Colapsar todo**: contrae o expande de golpe todos los editores de comandos del libro activo.",
        "El **sol / la luna**: cambia entre el tema oscuro y el claro.",
        "El **selector de idioma**: cambia el idioma de la interfaz.",
        "El **libro**: abre esta documentación.",
        "La **flecha roja**: resetea el espacio de trabajo. Lo borra todo, así que la app siempre te pide confirmación antes.",
        "**Exportar**: guarda el libro activo en un archivo. También tiene su propia sección más adelante.",
      ],
    },
    mainPanel: {
      intro:
        "El panel principal es tu mesa de trabajo. Arriba está la **barra de pestañas** con tus libros abiertos; debajo, los bloques del libro activo; y al final, la fila **NUEVO BLOQUE** para seguir agregando contenido.",
      teaser:
        "¿Bloques? ¿Pestañas? No te preocupes: son justo lo que vas a aprender a continuación.",
    },
    tabs: {
      intro: "Cada pestaña contiene un libro abierto.",
      items: [
        "**Haz clic** en una pestaña para cambiar a ella.",
        "**Arrastra** una pestaña para reordenarla.",
        "**Clic con la rueda** del ratón en una pestaña para cerrarla.",
      ],
      autoCreate:
        "Si no hay pestañas abiertas y agregas un bloque o una variable, se crea automáticamente una pestaña nueva sin título.",
      labelDemo:
        "Una pestaña toma su nombre del primer bloque de nota de su libro, así que tus pestañas se describen solas. Míralo en vivo abajo: la nota pertenece a la pestaña activa, y editarla renombra la pestaña mientras escribes. Prueba también a cambiar, reordenar y cerrar pestañas.",
    },
    sidebar: {
      intro:
        "La barra lateral contiene la biblioteca de libros y el panel de variables.",
      items: [
        "**Contraer / expandir**: haz clic en el botón de flecha o usa su atajo de teclado.",
        "**Mover a izquierda / derecha**: haz clic en el botón de disposición para mover la barra lateral al otro lado de la pantalla.",
        "**Redimensionar**: arrastra el borde interior de la barra lateral; doble clic para contraerla.",
      ],
      resizeDetails:
        "Arrastrar la barra lateral hasta dejarla muy estrecha la contrae por completo, y nunca puede crecer más allá de la mitad de la pantalla. Al expandirla de nuevo vuelve a su ancho normal.",
    },
    runbookLibrary: {
      intro:
        "La sección **LIBROS** de la barra lateral contiene tus libros importados.",
      items: [
        "Haz clic en **Importar** para cargar uno o varios archivos `.json` a la vez, o en **Pegar** para crear un libro desde JSON en bruto.",
        "Haz clic en cualquier entrada para abrirla. Si ya está abierta en una pestaña, esa pestaña pasa a estar activa.",
        "Elimina un libro de la biblioteca con el botón que aparece al pasar el cursor sobre la fila.",
        "Arrastra el control a la izquierda de una entrada para reordenar la lista.",
        "Usa la **barra de búsqueda** para filtrar libros por su etiqueta o nombre de archivo.",
      ],
      autoLabel:
        "**Etiquetado automático:** si el primer bloque de un libro es una nota, su texto se usa como etiqueta en la biblioteca, de modo que las entradas se describen solas. En caso contrario se usa el nombre del archivo importado.",
      labelDetails:
        "Las etiquetas se normalizan: se quita el formato markdown y lo que pase de 60 caracteres se recorta.",
      autoSave:
        "Los cambios hechos al libro activo se guardan automáticamente en su entrada de la biblioteca.",
    },
    variables: {
      intro:
        "Las variables se definen en la sección **VARIABLES** de la barra lateral. Cada variable tiene una **clave** y un **valor**. Las claves distinguen mayúsculas de minúsculas, y las variables con clave vacía se ignoran.",
      usage:
        "Usa una variable en cualquier comando envolviendo su clave en llaves, p. ej. `{NAMESPACE}`. Renombrar una clave actualiza todos los comandos que la usan, y las variables que ningún comando usa se atenúan para que detectes las que ya no necesitas.",
      unresolved:
        "Si un comando referencia una clave que no existe, o una variable con valor vacío, esa parte se resalta como **sin resolver**. Copiar sigue funcionando: la referencia se copia tal cual está escrita, como {NOMBRE}.",
      duplicatesAndEmpty:
        "Un detalle más: si dos variables comparten la misma clave, gana la definida en último lugar.",
    },
    variableReferences: {
      intro:
        "El valor de una variable puede referenciar otras variables; estas se resuelven recursivamente. Así puedes construir valores como `https://{HOST}/api` a partir de piezas más pequeñas.",
      circular:
        "Las referencias circulares son seguras: si dos variables se referencian entre sí, la app detecta el bucle y deja la referencia como texto plano.",
    },
    parameterizedPlaceholders: {
      intro:
        "El valor de una variable puede contener un marcador `{;nombre}` que no se rellena hasta que la variable es referenciada.",
      fill: "Rellénalo por referencia con `{clave;nombre=valor}`: el valor se inyecta justo donde está el marcador, algo que una variable normal no puede hacer con la misma elegancia. Proporciona varios marcadores separándolos con `;`, p. ej. `{A;p1=v1;p2=v2}`.",
      unresolved:
        "Si una referencia omite el valor de un marcador, el marcador `{;nombre}` se deja en su lugar y el comando se considera sin resolver.",
    },
    escapingBraces: {
      intro:
        "Antepón una barra invertida a `{` o `}` en un bloque de comando para mostrar la llave literalmente en vez de iniciar una referencia de variable. La barra invertida se elimina del comando resuelto.",
      scope:
        "El escape aplica solo dentro de bloques de comando; las barras invertidas en valores de variables son siempre literales.",
    },
    secretVariables: {
      intro:
        "Haz clic en el **icono de ojo** de una fila de variable para marcarla como **secreta**. Los valores secretos se ocultan en la barra lateral y se sustituyen silenciosamente en las vistas previas de comandos.",
    },
    blocks: {
      intro:
        "Los bloques son el contenido principal de un libro. Agrégalos con la fila **NUEVO BLOQUE** al final del panel principal.",
    },
    commandBlock: {
      intro:
        "Un bloque de comando guarda un comando que quieres tener a mano. Tiene dos partes:",
      parts: [
        "**Vista previa** (siempre visible): el comando exactamente como se copiará. Haz clic en **Copiar** para enviarlo a tu portapapeles.",
        "**Editor** (contraíble): donde escribes el comando. Usa el botón de flecha para ocultarlo cuando solo necesites la vista previa.",
      ],
      multiline:
        "Los comandos pueden ocupar varias líneas, y el editor se desplaza hacia los lados cuando una línea se hace demasiado larga.",
      gutterNote:
        "El margen izquierdo marca la primera línea con `$` y numera cada línea extra. Prueba a agregar una línea abajo para ver crecer la numeración.",
      variablesTeaser:
        "Los bloques de comando se vuelven mucho más útiles con las **variables**, que rellenan las partes de un comando que cambian. Se explican un poco más adelante, en su propia sección.",
    },
    noteBlock: {
      intro:
        "Un bloque de texto libre. Las notas se expanden a lo alto y a lo ancho mientras escribes.",
      styles:
        "Hay tres estilos de texto seleccionables al pasar el cursor: **título** (grande, en negrita), **subtítulo** (mediano, acentuado) y **cuerpo** (la prosa por defecto).",
      markdown: "Las notas soportan formato markdown:",
      tableSyntax: "Sintaxis",
      tableResult: "Resultado",
      autoUrls:
        "Las URLs sueltas se detectan automáticamente y se convierten en enlaces clicables, sin necesidad de markdown.",
      noNesting:
        "Los estilos no se combinan: negrita y cursiva no pueden mezclarse en las mismas palabras, por ejemplo. Gana el estilo que empieza primero.",
      links: "Para abrir un enlace, mantén `Ctrl` y haz clic en él.",
      wrapKeys:
        "Con texto seleccionado en una nota, `Ctrl+B` lo envuelve en negrita, `Ctrl+I` en cursiva y **Ctrl+´** en comillas invertidas; escribir **(**, **[** o **{** lo envuelve en ese par.",
    },
    dividerBlock: {
      intro:
        "No es más que un separador visual. Se estira hasta igualar el ancho del bloque más ancho, lo que lo hace perfecto para dividir un libro en secciones. Eso sí, tiene una anchura mínima que le impide encogerse hasta volverse ilegible.",
      demoNote:
        "Escribe dentro de esta nota y observa cómo el divisor de abajo crece y se encoge con ella.",
    },
    multiSelect: {
      intro:
        "Mantén `Shift` y haz clic en bloques para construir una selección. También puedes mantener `Shift` y arrastrar el ratón sobre los bloques para seleccionarlos con un lazo. Lazar bloques ya seleccionados los deselecciona.",
      actions: [
        "**Arrastra** el control de cualquier bloque seleccionado para mover todos los bloques seleccionados juntos, conservando el orden relativo.",
        "**Copiar a otra pestaña**: arrastra el control de cualquier bloque seleccionado sobre una pestaña para copiar toda la selección dentro de ella.",
        "**Duplicar**: `Ctrl+D` duplica el grupo completo, insertado después del último bloque seleccionado.",
        "**Eliminar**: `Del` elimina el grupo completo.",
      ],
      clear:
        "Pulsa `Escape` o haz clic fuera de los controles de bloque para limpiar la selección.",
      dragToTabDelay:
        "Mientras arrastras bloques sobre la barra de pestañas, mantén el cursor un momento sobre una pestaña para cambiar a ella, y luego suelta.",
      demoHint:
        "Pruébalo con los bloques de abajo: mantén `Shift` y haz clic en algunos bloques, luego pulsa `Ctrl+D` para duplicarlos o `Del` para eliminarlos. `Escape` limpia la selección.",
    },
    readMode: {
      intro:
        "El modo lectura bloquea la edición, no la navegación. Haz clic en el **icono de candado** de la cabecera para activarlo:",
      rules: [
        "Todos los editores de comandos se contraen y no pueden expandirse.",
        "El texto de bloques y notas no puede editarse.",
        "La estructura de bloques no puede cambiarse (sin agregar, eliminar ni reordenar).",
        "Los valores de las variables sí pueden cambiarse.",
        "Los libros sí pueden abrirse.",
        "Los enlaces se pueden abrir con un clic directo.",
      ],
      persisted:
        "Este modo forma parte de tus preferencias guardadas, así que recargar la app te mantiene en modo lectura.",
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
      untitledNote:
        "Los marcadores Sin título no se escriben en el archivo exportado.",
    },
    language: {
      intro:
        "Usa el **selector de idioma** de la cabecera para elegir el idioma de la interfaz.",
      detection:
        "La app detecta el idioma de tu navegador en la primera visita, y tu elección se recuerda después.",
    },
    keyboardShortcuts: {
      intro: "Todos los atajos disponibles en la app.",
    },
    qa: {
      intro:
        "Respuestas rápidas a las preguntas que surgen con más frecuencia.",
      items: [
        {
          question: "¿Dónde se guardan mis datos?",
          answer:
            "Todo vive en tu navegador: las preferencias y los metadatos de pestañas en localStorage, el contenido de los libros en IndexedDB. Nada se envía a ningún servidor.",
        },
        {
          question: "¿Cómo respaldo un libro o lo llevo a otra máquina?",
          answer:
            "Expórtalo como **JSON** e importa el archivo en la otra máquina. La exportación JSON contiene el espacio de trabajo completo (variables y bloques) y siempre puede reimportarse.",
        },
        {
          question: "¿Qué elimina exactamente Resetear espacio de trabajo?",
          answer:
            "Todo: cada pestaña, cada libro de la biblioteca, cada variable y cada preferencia. Es un borrado completo del almacenamiento local de la app y no se puede deshacer, así que exporta antes lo que te importe.",
        },
        {
          question: "¿Por qué parte de mi comando aparece resaltada en rojo?",
          answer:
            "Esa parte es una referencia sin resolver: no existe ninguna variable con esa clave (las claves distinguen mayúsculas de minúsculas), o a un marcador `{;nombre}` no se le dio valor.",
        },
        {
          question: "¿Las variables secretas están cifradas?",
          answer:
            "No. Marcar una variable como secreta solo oculta su valor en la barra lateral y en las vistas previas de comandos. El valor sigue guardado en texto plano en el almacenamiento local de tu navegador.",
        },
        {
          question:
            "¿Por qué la exportación descarga directamente en vez de preguntar dónde guardar?",
          answer:
            "El diálogo nativo de guardado usa la File System Access API, disponible en navegadores basados en Chromium (Chrome, Edge, Brave). Los navegadores sin ella recurren a una descarga directa.",
        },
        {
          question: "¿Puedo agregar otro idioma a la interfaz?",
          answer:
            "Sí, mediante una contribución al proyecto. Cada idioma es un único archivo de catálogo, así que agregar uno es un cambio solo de datos.",
        },
      ],
    },
  },
};
