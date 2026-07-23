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
  contextMenu: {
    copyMarkdown: "Copiar libro como Markdown",
    minimap: "Minimapa",
    moveMinimapLeft: "Mover minimapa a la izquierda",
    moveMinimapRight: "Mover minimapa a la derecha",
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
    dropToImport: "Suelta los libros para importarlos",
    clearLibrary: "Eliminar todo",
    clearLibraryTitle: "Eliminar todos los libros de la biblioteca",
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
    dragResizeSplit:
      "Arrastra para redimensionar clave y valor · doble clic para igualarlos",
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
    clearLibraryTitle: "Eliminar Todos los Libros",
    clearLibraryConfirm: "Eliminar todo",
    clearLibraryMessage:
      "¿Eliminar todos los libros de la biblioteca, junto con sus variables y bloques? Esta acción no se puede deshacer.",
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
    [KeyBinding.CLEAR_LIBRARY]: "Abrir el diálogo de eliminar todos los libros",
    [KeyBinding.TOGGLE_MINIMAP]:
      "Abrir el menú del minimapa (en el contenido del libro)",
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
    [KeyBinding.WRAP_SELECTION]:
      "Envolver el texto seleccionado en el par escrito (cualquier campo de texto)",
  },
  footer: {
    privacy: "Privacidad",
    terms: "Términos",
  },
  home: {
    meta: {
      openApp: "Abrir app",
    },
    hero: {
      eyebrow: "Libros de comandos con variables",
      title: "Escribe los comandos una vez. Reutilízalos en todas partes.",
      subtitle:
        "Define tus variables una sola vez, referéncialas en cada comando y copia comandos totalmente resueltos con un clic. Sin servidor, sin cuentas, todo se queda en tu navegador.",
      primaryCta: "Abrir CommandPad",
      secondaryCta: "Ver la documentación",
    },
    demo: {
      title: "Míralo en acción",
      hint: "Cambia un valor abajo y observa cómo cada comando se actualiza en vivo.",
    },
    features: {
      title: "Por qué no vas a querer soltarlo",
      subtitle:
        "Una herramienta pequeña que resuelve, sin hacer ruido, una molestia de todos los días. Esto es lo que suele conquistar a la gente.",
      items: [
        {
          title: "Cambia una cosa, no veinte",
          body: "Actualiza un host o un número de versión en un solo sitio y cada comando que lo menciona se pone al día al instante. Nada de buscar y reemplazar, ni de una copia vieja del valor escondida tres líneas más abajo.",
        },
        {
          title: "Copia comandos listos para ejecutar",
          body: "Cada `{VARIABLE}` se resuelve mientras escribes, así que la vista previa es el comando de verdad. Un clic lo deja en tu portapapeles con los valores reales ya puestos: pega, ejecuta y listo.",
        },
        {
          title: "Libros que seguirás entendiendo con el tiempo",
          body: "Entrelaza comandos con notas en Markdown y separadores para que un libro se lea como la explicación que le darías a un compañero, y no como una pila de líneas de terminal que tendrás que descifrar dentro de unos meses.",
        },
        {
          title: "Tuyo, y de nadie más",
          body: "Sin backend, sin cuenta, sin analíticas mandando datos a escondidas. Todo vive en tu navegador, y las variables secretas nunca salen del equipo donde las escribiste.",
        },
        {
          title: "Hecho para no estorbarte",
          body: "Pestañas, reordenar arrastrando, selección de varios bloques, modo lectura, atajos de teclado, tema claro y oscuro, inglés y español. Esos pequeños detalles que dejas de notar porque sencillamente funcionan.",
        },
        {
          title: "Tu trabajo va contigo",
          body: "Exporta a JSON, Markdown o texto plano y vuelve a cargarlo sin problema en otro equipo. Tus libros son archivos normales que te pertenecen, nunca atrapados en un formato que solo esta app sepa leer.",
        },
      ],
    },
    closing: {
      title: "¿Listo para crear tu primer libro?",
      body: "CommandPad funciona por completo en tu navegador. Nada que instalar, nada que registrar.",
      cta: "Abrir CommandPad",
    },
  },
  privacy: {
    title: "Política de Privacidad",
    updated: "Última actualización: 22 de julio de 2026",
    intro:
      "CommandPad es una aplicación del lado del cliente que funciona por completo en tu navegador. Esta política explica qué datos maneja la app y, más importante aún, cuáles no.",
    sections: [
      {
        heading: "La versión corta",
        paragraphs: [
          "CommandPad no tiene servidor backend, ni cuentas de usuario, ni analítica o seguimiento. La app no recopila, transmite ni vende ninguno de tus datos. Todo lo que creas se queda en tu dispositivo.",
        ],
      },
      {
        heading: "Qué datos se almacenan",
        paragraphs: [
          "Todos los datos que introduces, como variables, comandos, notas y libros, se guardan localmente en tu navegador para que tu trabajo siga ahí cuando vuelvas.",
        ],
        bullets: [
          "**localStorage** guarda tus preferencias (tema, idioma, disposición) y metadatos ligeros de las pestañas.",
          "**IndexedDB** guarda el contenido real de los libros (tus variables y bloques de comandos).",
        ],
      },
      {
        heading: "Qué no hacemos",
        paragraphs: [
          "Queremos ser explícitos sobre las cosas que CommandPad evita deliberadamente.",
        ],
        bullets: [
          "No enviamos tus datos a ningún servidor. No hay servidor al que enviarlos.",
          "No usamos cookies, identificadores publicitarios ni analítica de terceros.",
          "No seguimos tu comportamiento entre sitios ni construimos un perfil sobre ti.",
          "No requerimos una cuenta, un correo electrónico ni ningún inicio de sesión.",
        ],
      },
      {
        heading: "Variables secretas",
        paragraphs: [
          "Las variables marcadas como secretas solo se **enmascaran** en la interfaz. No están cifradas y se almacenan en texto plano en el almacenamiento local de tu navegador, igual que cualquier otra variable. No trates las variables secretas como una bóveda segura.",
        ],
      },
      {
        heading: "Enlaces externos",
        paragraphs: [
          "Las notas pueden contener enlaces que tú mismo añades, y la app enlaza a sitios externos como GitHub y LinkedIn. Una vez que sigues un enlace, se aplican las prácticas de privacidad de ese destino. Esta política solo cubre a CommandPad.",
        ],
      },
      {
        heading: "Control de tus datos",
        paragraphs: [
          "Como todo es local, siempre tienes el control. Usa **Exportar** para respaldar un libro como JSON, y usa **Restablecer espacio de trabajo** para borrar de forma permanente todos los datos almacenados localmente. Borrar los datos del sitio en tu navegador tiene el mismo efecto.",
        ],
      },
      {
        heading: "Cambios en esta política",
        paragraphs: [
          "Si esta política cambia, la fecha de actualización en la parte superior de la página cambiará con ella. El uso continuado de la app refleja tu aceptación de la política vigente.",
        ],
      },
    ],
  },
  terms: {
    title: "Términos del Servicio",
    updated: "Última actualización: 22 de julio de 2026",
    intro:
      "Estos términos rigen tu uso de CommandPad. Al usar la app aceptas estos términos. Por favor, léelos, ya que son breves y están redactados para ser comprensibles.",
    sections: [
      {
        heading: "Aceptación de los términos",
        paragraphs: [
          "Al acceder o usar CommandPad, aceptas quedar sujeto a estos términos. Si no estás de acuerdo, por favor no uses la app.",
        ],
      },
      {
        heading: "El servicio",
        paragraphs: [
          "CommandPad es una herramienta gratuita del lado del cliente para crear libros de comandos con variables. Funciona en tu navegador y almacena tu trabajo localmente en tu dispositivo. Se ofrece tal cual, y las funciones pueden cambiar o eliminarse con el tiempo.",
        ],
      },
      {
        heading: "Tus responsabilidades",
        paragraphs: [
          "Eres responsable de los comandos y del contenido que creas y de cómo los usas.",
        ],
        bullets: [
          "Revisa cada comando antes de ejecutarlo. CommandPad resuelve y copia texto; no ejecuta nada por ti.",
          "Mantén tus propias copias de seguridad de lo importante exportando tus libros.",
          "No confíes en las variables secretas como almacenamiento seguro de credenciales sensibles.",
          "Usa la app cumpliendo las leyes y políticas que se te apliquen.",
        ],
      },
      {
        heading: "Sin garantía",
        paragraphs: [
          "CommandPad se ofrece **sin garantías de ningún tipo**, expresas o implícitas, incluida la idoneidad para un propósito concreto. No garantizamos que la app funcione sin interrupciones, sin errores, ni que los datos almacenados localmente nunca se pierdan.",
        ],
      },
      {
        heading: "Limitación de responsabilidad",
        paragraphs: [
          "En la máxima medida permitida por la ley, el autor no es responsable de ningún daño derivado de tu uso de la app, incluida la pérdida de datos o cualquier consecuencia de ejecutar comandos que hayas ensamblado con ella.",
        ],
      },
      {
        heading: "Datos y privacidad",
        paragraphs: [
          "CommandPad almacena tus datos localmente y no los transmite. Para más detalles, consulta la Política de Privacidad, que se incorpora a estos términos por referencia.",
        ],
      },
      {
        heading: "Cambios en estos términos",
        paragraphs: [
          "Estos términos pueden actualizarse de vez en cuando. La fecha de actualización en la parte superior refleja la última revisión, y el uso continuado de la app constituye la aceptación de los términos vigentes.",
        ],
      },
    ],
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
      minimap:
        "En el borde derecho vive el **minimapa**: una miniatura de los bloques reales del libro que reemplaza a la barra de desplazamiento. Haz clic o arrastra sobre él para saltar a cualquier punto de un libro. Haz **clic derecho** en cualquier parte del contenido del libro para abrir un pequeño menú donde puedes activarlo o desactivarlo, o moverlo al otro lado.",
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
        "También puedes **arrastrar archivos** desde tu explorador de archivos y soltarlos sobre la sección para importarlos.",
        "Haz clic en cualquier libro para abrirlo. Si ya está abierto en una pestaña, esa pestaña pasará a estar activa.",
        "Elimina un libro de la biblioteca con el botón que aparece al pasar el cursor sobre la fila.",
        "Haz clic en **Eliminar todo** para vaciar la biblioteca completa de una vez.",
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
      split:
        "Las claves y los valores se reparten la fila en partes iguales, pero puedes cambiarlo: arrastra el divisor entre ambos para dar más espacio a uno de los lados, y haz doble clic para volver al reparto equitativo. El nuevo reparto se aplica a todas las variables y se recuerda entre sesiones.",
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
        "Con texto seleccionado en una nota, `Ctrl+B` lo envuelve en negrita, `Ctrl+I` en cursiva y **Ctrl+´** en comillas invertidas; escribir **(**, **[**, **{**, **\"** o **'** lo envuelve en ese par. Envolver en pares no es exclusivo de las notas, funciona igual en el editor de comandos.",
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
        "**Duplicar**: `Ctrl+D` duplica el grupo completo, insertado después del último bloque seleccionado.",
        "**Eliminar**: `Del` elimina el grupo completo.",
        "**Copiar a otra pestaña**: arrastra el control de cualquier bloque seleccionado sobre una pestaña para copiar toda la selección dentro de ella. Las variables referenciadas viajan con los bloques; si la pestaña de destino ya define alguna con un valor distinto, la copia se añade con un nuevo nombre `CLAVE_COPY` y los bloques copiados se reescriben para referenciarla, de modo que no se tocan los valores de ninguna pestaña.",
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
      copyMarkdown:
        "Para saltarte los archivos por completo, haz clic derecho dentro del libro y elige **Copiar libro como Markdown**. Pone el mismo contenido Markdown en tu portapapeles, listo para pegarlo en un chat, un ticket o un documento.",
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
