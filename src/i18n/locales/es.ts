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
    followLinkTooltip: (binding?: string) =>
      binding ? `Seguir enlace (${binding})` : "Seguir enlace",
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
      multiSelectNotes: ["Crear la copia de seguridad", "Limpiar"],
      greetingTemplate: "¡Hola {;name}, bienvenido a {;place}!",
      noteSample:
        "Haz clic en esta nota para ver su texto en bruto: mezcla **negrita**, _cursiva_, `código` y un enlace, p. ej. https://example.com. Haz clic fuera para verla renderizada de nuevo.",
    },
    gettingStarted: {
      intro:
        "¡Bienvenido a CommandPad! Aquí vas a construir **libros de comandos**: documentos que mezclan los comandos que ejecutas a menudo con las notas que ayudan a explicarlos.",
      why: "Ya conoces el ritual: rebuscar en el historial de la terminal, escarbar en mensajes de chat antiguos o mantener un `comandos.txt` en alguna parte de tu computadora. Un libro de comandos acaba con eso. Cada comando vive junto a la nota que lo explica, con las partes que cambian ya rellenadas, listo para copiar.",
      journey:
        "Esta guía te acompaña paso a paso por cómo funciona la aplicación, para que le saques todo el provecho. Empezarás por el espacio de trabajo y su barra lateral, luego conocerás los tres tipos de bloques con los que se construyen tus libros de comandos y, para cerrar, las variables: la característica que hace que los bloques de comando sean realmente potentes.",
      navigate:
        "Puedes leerla de principio a fin o saltar directo a lo que te interese desde el índice de la izquierda: tú eliges el ritmo.",
      tryIt:
        "La mayoría de las secciones trae un ejemplo real y funcional marcado **Pruébalo**, una pieza de la app con la que puedes jugar, nada de lo que hagas ahí toca tu espacio de trabajo real. Anímate a toquetear un poco, es la forma más rápida de entender cómo funciona algo. Si te pierdes, el botón de flecha en su esquina te devuelve al punto de partida.",
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
        "**Haz clic** en el **+** al final de la barra de pestañas para abrir una pestaña nueva.",
      ],
      autoCreate:
        "Si no hay pestañas abiertas y agregas un bloque o una variable, se crea automáticamente una pestaña nueva sin título.",
      labelDemo:
        "Una pestaña toma su nombre del primer bloque de nota de su libro, así tus pestañas se describen solas. Míralo en vivo abajo: la nota pertenece a la pestaña activa, y editarla renombra la pestaña mientras escribes. Pruébalo todo aquí: agrega una pestaña con el **+**, arrástralas, cambia entre ellas y cierra alguna.",
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
        "Haz clic en cualquier libro para abrirlo. Si ya está abierto en una pestaña, esa pestaña pasará a estar activa.",
        "Elimina un libro de la biblioteca con el botón que aparece al pasar el cursor sobre la fila.",
        "Arrastra el control a la izquierda de un libro para reordenarlo en la lista.",
        "Usa la **barra de búsqueda** para filtrar libros por su etiqueta o nombre de archivo.",
      ],
      autoLabel:
        "**Etiquetado automático:** si el primer bloque de un libro es una nota, su texto se usa como etiqueta en la biblioteca, de modo que los libros se describen solos. En caso contrario se usa el nombre del archivo importado.",
      labelDetails:
        "Las etiquetas se normalizan: se limpia el formato markdown y se recorta hasta 60 caracteres.",
      autoSave:
        "Los cambios hechos al libro activo se guardan automáticamente en la biblioteca.",
    },
    variables: {
      why: "Esta es la característica sobre la que gira todo lo demás. Un nombre de servidor, una ruta, un número de versión: los mismos valores se repiten en la mitad de los comandos que guardas, y el día que uno cambia toca buscarlo comando por comando. Con las variables defines ese valor **una vez**, y todos los comandos que lo usan se actualizan solos.",
      intro:
        "Las variables se definen en la sección **VARIABLES** de la barra lateral. Cada variable tiene una **clave** y un **valor**. Las claves distinguen mayúsculas de minúsculas.",
      usage:
        "Usa una variable en cualquier comando envolviendo su clave en llaves, p. ej. `{SERVER}`. Renombrar una clave actualiza todos los comandos que la usan, y las variables que ningún comando usa se atenúan para que detectes las que ya no necesitas.",
      unresolved:
        "Si un comando referencia una clave que no existe, o una variable con valor vacío, esa parte se resalta como **sin resolver**.",
      duplicatesAndEmpty:
        "Si dos variables comparten la misma clave, gana la definida en último lugar. Pasa el cursor sobre una fila para revelar sus controles: un control de arrastre a la izquierda para reordenarla con otras variables y un botón de eliminar a la derecha. Pruébalos en las demos de esta sección.",
      tooltip:
        "Si una clave o un valor no cabe en su casilla, pasa el cursor sobre ella para ver el texto completo en un tooltip.",
      demoHint:
        "Compruébalo abajo: una sola variable `SERVER` alimenta dos comandos. Edita su valor y mira cómo las dos vistas previas cambian mientras escribes. Esa es toda la idea.",
    },
    variableReferences: {
      intro:
        "El valor de una variable puede referenciar otras variables. Así puedes construir valores a partir de piezas más pequeñas.",
      demoHint:
        "Abajo, `BASE_URL` se construye a partir de `HOST`. Cambia `HOST` y observa cómo el cambio se propaga hasta el comando:",
      circular:
        "Las referencias circulares son seguras: si dos variables se referencian entre sí, la app detecta el bucle y deja la referencia como texto plano.",
    },
    parameterizedPlaceholders: {
      intro:
        "A veces una variable te sirve para casi todo, excepto por una pequeña parte que cambia cada vez que la usas. Los marcadores parametrizados te permiten dejar ese trozo en blanco dentro de la variable, y rellenarlo distinto cada vez que la uses.",
      fill: "Marca el espacio en blanco con `{;param}` dentro del valor de la variable. Funciona como una frase para completar: la variable guarda el texto fijo, y tú pones la palabra que falta cada vez que la usas. Donde referencies esa variable, rellena el hueco con `{clave;param=valor_param}`, y tu valor cae justo donde estaba el espacio en blanco.",
      seeExample:
        "Si suena abstracto, no te preocupes: se entiende al instante en cuanto lo ves. Échale un vistazo al ejemplo de abajo antes de seguir leyendo.",
      multiple:
        "Un valor puede tener varios huecos. Dale a cada uno un nombre distinto y rellénalos todos en la misma referencia, separados por punto y coma:",
      nested:
        "Un hueco también puede rellenarse con otra variable. Así, un mismo valor puede rellenar el hueco de un comando y usarse por su cuenta en otro:",
    },
    escapingBraces: {
      intro:
        "Antepón una barra invertida a `{` o `}` en un bloque de comando para mostrar la llave literalmente en vez de iniciar una referencia de variable. La barra invertida se excluye del comando resuelto.",
      tryHint:
        "Prueba a borrar las barras invertidas del comando de abajo y mira cómo las llaves literales se convierten en una referencia activa:",
      scope:
        "El escape solo aplica dentro de bloques de comando; las barras invertidas en valores de variables se muestran siempre tal cual.",
    },
    secretVariables: {
      intro:
        "Haz clic en el **icono de ojo** de una fila de variable para marcarla como **secreta**. Los valores secretos se ocultan en la barra lateral y se sustituyen por asteriscos en las vistas previas de comandos.",
      copyNote:
        "El enmascarado es puramente visual: el botón **Copiar** siempre pone el valor **real** en tu portapapeles, así que tus comandos siguen funcionando. Pruébalo abajo, y haz clic en el icono de ojo para mostrar u ocultar el valor.",
    },
    blocks: {
      intro:
        "Los bloques son el contenido principal de un libro. Agrégalos con la fila **NUEVO BLOQUE** al final del panel principal. Pasa el cursor sobre cualquier bloque para revelar sus controles: agarra el control de la izquierda para arrastrarlo a otro sitio, o usa los botones de **duplicar** y **eliminar** de la derecha.",
    },
    commandBlock: {
      intro:
        "Es un bloque que guarda un comando que quieras tener a mano. Tiene dos partes:",
      parts: [
        "**Vista previa** (siempre visible): el comando exactamente como se copiará. Haz clic en el botón **Copiar** para enviarlo a tu portapapeles. Este botón se deshabilita si el comando está vacío.",
        "**Editor** (contraíble): donde escribes el comando. Usa el botón de flecha para ocultarlo cuando solo necesites la vista previa.",
      ],
      multiline:
        "Los comandos pueden ocupar varias líneas, y el editor se puede scrollear hacia los lados cuando una línea se hace demasiado larga.",
      gutterNote:
        "El margen izquierdo marca la primera línea con `$` y numera cada línea extra. Prueba a agregar más líneas abajo para ver crecer la numeración.",
      variablesTeaser:
        "Los bloques de comando se vuelven mucho más útiles con las **variables**, que rellenan las partes de un comando que cambian. Se explican un poco más adelante, en su propia sección.",
    },
    noteBlock: {
      intro:
        "Es un bloque de texto libre. Las notas se expanden a lo alto y a lo ancho mientras escribes.",
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
      demoNote: "Escribe aquí y observa cómo el divisor crece o se encoge.",
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
      demoHint: "Pruébalo con los bloques de abajo:",
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
            "Todo vive en tu navegador: las preferencias y los metadatos de pestañas en **localStorage** y el contenido de los libros en **IndexedDB**. Nada se envía a ningún servidor.",
        },
        {
          question: "¿Cómo respaldo un libro o lo llevo a otra máquina?",
          answer:
            "Expórtalo como **JSON** e importa el archivo en la otra máquina. La exportación JSON contiene el espacio de trabajo completo (variables y bloques) y siempre puede reimportarse.",
        },
        {
          question: "¿Qué elimina exactamente Resetear el Espacio de Trabajo?",
          answer:
            "Todo: cada pestaña, cada libro de la biblioteca, cada variable y cada preferencia. Es un borrado completo del almacenamiento local de la app y no se puede deshacer, así que exporta antes lo que quieras salvar.",
        },
        {
          question: "¿Por qué parte de mi comando aparece resaltado en rojo?",
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
            "Sí, mediante una contribución al proyecto. Cada idioma es un único archivo de catálogo, así que agregar uno involucra un simple cambio de datos.",
        },
      ],
    },
  },
};
