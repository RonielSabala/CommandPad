import { VaultConfig } from "@/common/config";
import { DocsSectionId } from "@/common/constants/docs";
import {
  BlockType,
  NoteStyle,
  PanelId,
  RunbookSyncStatus,
  VaultError,
  VaultField,
  VaultPrompt,
  VaultStatus,
} from "@/common/enums";
import { KeyBinding } from "@/common/keybindings";
import { codeBulletList } from "../lists";
import { MessageSlot } from "../slots";
import type { Messages } from "../types";

const andMore = (count: number) => `_y ${count} más..._`;

export const es: Messages = {
  common: {
    loading: "Cargando…",
    cancel: "Cancelar",
    close: "Cerrar",
    back: "Atrás",
    ok: "Aceptar",
    create: "Crear",
    save: "Guardar",
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
  panel: {
    names: {
      [PanelId.SIDEBAR]: "barra lateral",
      [PanelId.DOCS_TOC]: "navegación",
    },
    expand: (name) => `Expandir ${name}`,
    collapse: (name) => `Contraer ${name}`,
    moveLeft: (name) => `Mover ${name} a la izquierda`,
    moveRight: (name) => `Mover ${name} a la derecha`,
    doubleClickExpand: "Doble clic para expandir",
    dragResizeCollapse:
      "Arrastra para redimensionar · doble clic para contraer",
  },
  contextMenu: {
    copyMarkdown: "Copiar libro como Markdown",
    minimap: "Minimapa",
    moveMinimapLeft: "Mover minimapa a la izquierda",
    moveMinimapRight: "Mover minimapa a la derecha",
    spellcheck: "Corregir ortografía en las notas",
  },
  runbooks: {
    title: "LIBROS",
    searchPlaceholder: "Buscar libros…",
    empty: "No hay libros importados.",
    import: "Importar",
    importTitle: "Importar libro",
    paste: "Pegar",
    pasteTitle: "Pegar JSON de libro",
    actions: "Acciones del libro",
    duplicate: "Duplicar libro",
    removeFromLibrary: "Quitar de la biblioteca",
    dropToImport: "Suelta los libros para importarlos",
    clearLibrary: "Eliminar todo",
    clearLibraryTitle: "Eliminar todos los libros de la biblioteca",
    stopSyncing: "Dejar de sincronizar",
    syncStatus: {
      [RunbookSyncStatus.SYNCED]: (provider) => `Sincronizado con ${provider}`,
      [RunbookSyncStatus.SYNCING]: (provider) => `Guardando en ${provider}…`,
      [RunbookSyncStatus.SIGNED_OUT]: (provider) =>
        `Inicia sesión en ${provider} para seguir sincronizando`,
      [RunbookSyncStatus.ERROR]: (provider) =>
        `No se pudo guardar en ${provider} · haz clic para reintentar`,
    },
    secretStatus: {
      [VaultStatus.UNLOCKED]:
        "Los secretos están cifrados · haz clic para cambiar la frase de contraseña",
      [VaultStatus.LOCKED]:
        "Los secretos están bloqueados · haz clic para desbloquearlos",
      [VaultStatus.ABSENT]:
        "Los secretos se guardan sin cifrar · haz clic para poner una frase de contraseña",
      [VaultStatus.UNSUPPORTED]:
        "Este navegador no puede cifrar secretos, así que se guardan tal cual",
    },
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
    actions: "Acciones de la variable",
    duplicate: "Duplicar variable",
    renameCase: "Cambiar capitalización de la clave",
    remove: "Eliminar variable",
    dragResizeSplit:
      "Arrastra para redimensionar clave y valor · doble clic para igualarlos",
    unusedTitle: (key) => `${key} (sin usar)`,
  },
  tabs: {
    newTab: "Nueva pestaña",
    closeTab: "Cerrar pestaña",
  },
  source: {
    openSource: "Abrir archivo fuente",
    openPreview: "Abrir vista previa",
    invalid:
      "Este JSON de libro no es válido, así que el libro sigue en su última versión correcta.",
  },
  blocks: {
    newBlockLabel: "NUEVO BLOQUE",
    typeLabel: {
      [BlockType.COMMAND]: "Comando",
      [BlockType.NOTE]: "Nota",
      [BlockType.IMAGE]: "Imagen",
      [BlockType.DIVIDER]: "Divisor",
    },
    typeTitle: (label) => `Bloque de ${label.toLowerCase()}`,
    actions: "Acciones del bloque",
    insertAbove: "Insertar bloque arriba",
    insertBelow: "Insertar bloque abajo",
    duplicate: (count) =>
      count === 1 ? "Duplicar bloque" : "Duplicar bloques",
    delete: (count) => (count === 1 ? "Eliminar bloque" : "Eliminar bloques"),
    emptyTitle: "Aún no hay bloques.",
    emptyHint: "Agrega un comando o una nota abajo.",
  },
  command: {
    emptyPreview: "comando vacío",
    showEditor: "Mostrar editor",
    hideEditor: "Ocultar editor",
    showMoreLines: "Mostrar más líneas",
    showFewerLines: "Mostrar menos",
    copy: "Copiar comando",
    placeholder: "ssh {USUARIO}@{HOST}",
    extractVariable: "Extraer en una variable",
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
  image: {
    dropHint: "Suelta una imagen aquí, o pégala",
    choose: "Elegir una imagen",
    urlPlaceholder: "https://ejemplo.com/imagen.png",
    addUrl: "Añadir",
    viewFullscreen: "Ver a pantalla completa",
    previous: "Imagen anterior",
    next: "Imagen siguiente",
    position: (index, total) => `${index} / ${total}`,
    actions: "Acciones de la imagen",
    replace: "Reemplazar imagen",
    remove: "Eliminar imagen",
    emptyReadOnly: "Sin imagen",
    loadFailed: "No se pudo cargar esta imagen.",
    notAnImage: "Ese archivo no es una imagen.",
    invalidUrl: "Escribe una dirección de imagen http o https.",
    readFailed: "No se pudo leer esa imagen.",
    tooLarge: (limit) => `Las imágenes deben pesar menos de ${limit}.`,
  },
  exportModal: {
    title: "Exportar",
    cloudTitle: `Exportar a ${MessageSlot.PROVIDER}`,
    destinationLabel: "Destino",
    formatLabel: "Formato",
    filenameLabel: "Nombre del archivo",
    folderLabel: "Carpeta",
    changeFolder: "Cambiar",
    chooseFolder: "Elige una carpeta donde guardar.",
    selectFolder: "Guardar aquí",
    confirm: "Exportar",
    savingTo: (provider) => `Guardando en ${provider}…`,
    savedTo: (provider) => `Guardado en ${provider}`,
    exportError: "La exportación falló. Inténtalo de nuevo.",
    tryAgain: "Intentar de nuevo",
  },
  pasteModal: {
    title: "Pegar Libro",
    message: "Pega el JSON del libro para crear uno nuevo.",
    error: "Eso no parece un JSON de libro válido.",
  },
  destinationModal: {
    title: "Importar",
    message: "Elige desde dónde importar un libro.",
    local: "Este dispositivo",
  },
  vaultModal: {
    title: {
      [VaultPrompt.CREATE]: "Protege tus secretos",
      [VaultPrompt.UNLOCK]: "Desbloquea tus secretos",
      [VaultPrompt.CHANGE]: "Cambia tu frase de contraseña",
    },
    message: {
      [VaultPrompt.CREATE]: "Elige una frase de contraseña para este libro.",
      [VaultPrompt.UNLOCK]:
        "Introduce la frase de contraseña de este libro para descifrar sus valores secretos.",
      [VaultPrompt.CHANGE]:
        "Todos los secretos de este libro se vuelven a cifrar con la nueva frase de contraseña.",
    },
    unlockFileMessage: (filename) =>
      `\`${filename}\` contiene secretos cifrados con otra frase de contraseña. Introdúcela para abrirlos.`,
    submit: {
      [VaultPrompt.CREATE]: "Cifrar secretos",
      [VaultPrompt.UNLOCK]: "Desbloquear",
      [VaultPrompt.CHANGE]: "Cambiar frase de contraseña",
    },
    fieldLabel: {
      [VaultPrompt.CREATE]: {
        [VaultField.CURRENT]: "Frase de contraseña",
        [VaultField.NEXT]: "Frase de contraseña",
        [VaultField.CONFIRM]: "Repite la frase de contraseña",
      },
      [VaultPrompt.UNLOCK]: {
        [VaultField.CURRENT]: "Frase de contraseña",
        [VaultField.NEXT]: "Frase de contraseña",
        [VaultField.CONFIRM]: "Repite la frase de contraseña",
      },
      [VaultPrompt.CHANGE]: {
        [VaultField.CURRENT]: "Frase de contraseña actual",
        [VaultField.NEXT]: "Nueva frase de contraseña",
        [VaultField.CONFIRM]: "Repite la nueva frase de contraseña",
      },
    },
    reveal: "Mostrar frase de contraseña",
    hide: "Ocultar frase de contraseña",
    skip: "Ahora no",
    working: "Derivando clave…",
    errors: {
      [VaultError.TOO_SHORT]: `Usa al menos ${VaultConfig.MIN_PASSPHRASE_LENGTH} caracteres.`,
      [VaultError.MISMATCH]: "Las dos frases de contraseña no coinciden.",
      [VaultError.UNCHANGED]: "La nueva frase de contraseña es la que ya usas.",
      [VaultError.WRONG_PASSPHRASE]: "Esa frase de contraseña no funcionó.",
    },
  },
  cloudModal: {
    importTitle: `Importar desde ${MessageSlot.PROVIDER}`,
    changeProvider: "Cambiar de proveedor",
    signInPrompt: (provider) =>
      `Inicia sesión en ${provider} para explorar y administrar tus runbooks allí.`,
    signInOneDrive: "Iniciar sesión con Microsoft",
    signInGoogleDrive: "Iniciar sesión con Google",
    signOut: "Cerrar sesión",
    signedInAs: (account) => `Sesión iniciada como ${account}`,
    refresh: "Actualizar",
    emptyFiles: "Aún no hay nada guardado en esta carpeta.",
    emptyFolders: "Aún no hay carpetas aquí.",
    columnName: "Nombre",
    columnModified: "Modificado",
    columnSize: "Tamaño",
    sortAscending: (column) => `Ordenar por ${column}, ascendente`,
    sortDescending: (column) => `Ordenar por ${column}, descendente`,
    searchFilesPlaceholder: "Buscar archivos y carpetas",
    searchFoldersPlaceholder: "Buscar carpetas",
    noResultsFiles: "Ningún archivo o carpeta coincide con tu búsqueda.",
    noResultsFolders: "Ninguna carpeta coincide con tu búsqueda.",
    navigateBack: "Atrás",
    navigateForward: "Adelante",
    openFolderAction: (name) => `Abrir ${name}`,
    newFolder: "Nueva carpeta",
    folderNamePlaceholder: "Nombre de la carpeta",
    createFolder: "Crear carpeta",
    cancelNewFolder: "Cancelar nueva carpeta",
    importAction: (filename) => `Importar ${filename}`,
    entryActions: "Más acciones",
    selectRow: (name) => `Seleccionar ${name}`,
    deselectRow: (name) => `Deseleccionar ${name}`,
    selectAll: "Seleccionar todo",
    deselectAll: "Deseleccionar todo",
    clearSelection: "Quitar la selección",
    importFiles: "Importar archivos",
    rename: "Renombrar",
    edit: "Editar",
    duplicate: (count) =>
      count === 1 ? "Duplicar" : `Duplicar ${count} elementos`,
    download: (count) =>
      count === 1 ? "Descargar" : `Descargar ${count} elementos`,
    delete: (count) =>
      count === 1 ? "Eliminar" : `Eliminar ${count} elementos`,
    saveName: "Guardar nombre",
    cancelRename: "Cancelar renombrado",
    namePlaceholder: "Nombre del archivo",
    editTitle: (path) => `Editando \`${path}\``,
    editHint:
      "Al guardar, los cambios se escriben directamente en el archivo de la nube.",
    signInError: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    genericError: "Algo salió mal. Inténtalo de nuevo.",
    invalidFileError: "Ese archivo no parece un JSON de libro válido.",
    invalidJsonError:
      "Esto no es un JSON válido, así que todavía no se puede guardar.",
    readError: "No se pudo abrir el archivo. Inténtalo de nuevo.",
    saveError: "No se pudo guardar el archivo. Inténtalo de nuevo.",
    renameError: "No se pudo renombrar el archivo. Inténtalo de nuevo.",
    duplicateError: "No se pudo duplicar el archivo. Inténtalo de nuevo.",
    downloadError: "No se pudo descargar el archivo. Inténtalo de nuevo.",
    deleteError: "No se pudo eliminar el archivo. Inténtalo de nuevo.",
    renameFolderError: "No se pudo renombrar la carpeta. Inténtalo de nuevo.",
    duplicateFolderError: "No se pudo duplicar la carpeta. Inténtalo de nuevo.",
    downloadFolderError: "No se pudo descargar la carpeta. Inténtalo de nuevo.",
    deleteFolderError: "No se pudo eliminar la carpeta. Inténtalo de nuevo.",
    downloadEntriesError:
      "No se pudieron descargar los elementos seleccionados. Inténtalo de nuevo.",
    createFolderError: "No se pudo crear la carpeta. Inténtalo de nuevo.",
    nameTakenError: (filename) => `${filename} ya existe en esta carpeta.`,
  },
  alert: {
    defaultTitle: "Aviso",
  },
  confirm: {
    defaultTitle: "Confirmar",
  },
  dialogs: {
    overwriteTitle: "Sobrescribir Libro",
    overwriteConfirm: "Sobrescribir",
    overwriteMessage: (filename, existingName) =>
      `\`${filename}\` coincide con un libro que ya tienes.\n\nImportarlo **sobrescribirá** \`${existingName}\`.`,
    overwriteCloudFileTitle: "Sobrescribir Libro de la Nube",
    overwriteCloudFileConfirm: "Sobrescribir",
    overwriteCloudFileMessage: (filename) =>
      `\`${filename}\` ya existe en la carpeta seleccionada.\n\nExportar reemplazará su contenido, y **esto no se puede deshacer**.`,
    importFailedTitle: "Formato Inválido",
    importFailed: (count) =>
      count === 1
        ? "No se pudo importar **1 archivo** porque su formato no se reconoce."
        : `No se pudieron importar **${count} archivos** porque sus formatos no se reconocen.`,
    pastedRunbook: "Libro pegado",
    resetTitle: "Resetear Espacio de Trabajo",
    resetConfirm: "Resetear",
    resetMessage:
      "¿Eliminar **todas las variables, bloques, libros y preferencias**? Esto no se puede deshacer.",
    clearLibraryTitle: "Eliminar Todos los Libros",
    clearLibraryConfirm: "Eliminar todo",
    clearLibraryMessage:
      "¿Eliminar **todos los libros** de la biblioteca? Esto no se puede deshacer.",
    deleteRunbookTitle: "Eliminar Libro",
    deleteRunbookConfirm: "Eliminar",
    deleteRunbookMessage: (label) =>
      `¿Eliminar \`${label}\`? **Esto no se puede deshacer.**`,
    deleteCloudFileTitle: "Eliminar Libro de la Nube",
    deleteCloudFileConfirm: "Eliminar",
    deleteCloudFileMessage: (filename) =>
      `¿Eliminar \`${filename}\` de tu carpeta en la nube?\n\nTu proveedor lo guarda un tiempo en la _Papelera de reciclaje_, así que todavía puedes restaurarlo desde ahí.`,
    deleteCloudFolderTitle: "Eliminar Carpeta de la Nube",
    deleteCloudFolderConfirm: "Eliminar",
    deleteCloudFolderMessage: (name) =>
      `¿Eliminar la carpeta \`${name}\`?\n\nTu proveedor guarda un tiempo los elementos eliminados en la _Papelera de reciclaje_, así que todavía puedes restaurarlos desde ahí.`,
    deleteCloudEntriesTitle: "Eliminar Elementos de la Nube",
    deleteCloudEntriesConfirm: "Eliminar",
    deleteCloudEntriesMessage: (names) =>
      `¿Eliminar estos ${names.length} elementos de tu carpeta en la nube?\n${codeBulletList(names, andMore)}\n\nTu proveedor guarda un tiempo los elementos eliminados en la _Papelera de reciclaje_, así que todavía puedes restaurarlos desde ahí.`,
    duplicateCloudEntriesTitle: "Duplicar Elementos de la Nube",
    duplicateCloudEntriesConfirm: "Duplicar",
    duplicateCloudEntriesMessage: (names) =>
      `¿Hacer una copia de estos ${names.length} elementos en tu carpeta en la nube?\n${codeBulletList(names, andMore)}\n\nCada copia se añade junto al original, y una carpeta se copia con todo lo que contiene.`,
    importCloudFilesTitle: "Importar Archivos de la Nube",
    importCloudFilesConfirm: "Importar",
    importCloudFilesMessage: (names) =>
      `¿Importar estos ${names.length} archivos a tu biblioteca?\n${codeBulletList(names, andMore)}\n\nCada uno se añade como su propio runbook y queda vinculado a su archivo en la nube, así que los cambios posteriores se envían de vuelta a él.`,
    downloadCloudEntriesTitle: "Descargar Elementos de la Nube",
    downloadCloudEntriesConfirm: "Descargar",
    downloadCloudEntriesMessage: (names) =>
      `¿Descargar estos ${names.length} elementos de tu carpeta en la nube?\n${codeBulletList(names, andMore)}\n\nSe guardan juntos en un único archivo _.zip_, y una carpeta se descarga con todo lo que contiene.`,
    signOutCloudTitle: "Cerrar Sesión",
    signOutCloudConfirm: "Cerrar Sesión",
    signOutCloudMessage:
      "¿Cerrar sesión de esta cuenta? Tus libros **seguirán en la nube**, y puedes volver a iniciar sesión cuando quieras.",
    discardCloudEditTitle: "Descartar cambios",
    discardCloudEditConfirm: "Descartar",
    discardCloudEditMessage: (filename) =>
      `¿Cerrar el editor sin guardar? Se perderán tus **cambios sin guardar** en \`${filename}\`.`,
    replaceImageTitle: "Reemplazar imagen",
    replaceImageConfirm: "Reemplazar",
    replaceImageMessage:
      "Este bloque ya contiene una imagen. Al reemplazarla **se descarta la actual**.",
  },
  keybindings: {
    [KeyBinding.TOGGLE_MODE]: "Alternar modo lectura / edición",
    [KeyBinding.ESCAPE]: "Limpiar selección de bloques / cerrar diálogos",
    [KeyBinding.TOGGLE_SIDEBAR]: "Contraer / expandir el panel lateral",
    [KeyBinding.MOVE_SIDEBAR]: "Mover el panel lateral a izquierda / derecha",
    [KeyBinding.NEW_TAB]: "Abrir una nueva pestaña",
    [KeyBinding.CLOSE_TAB]: "Cerrar la pestaña activa",
    [KeyBinding.FOCUS_RUNBOOK]: "Seleccionar libro activo",
    [KeyBinding.NAVIGATE_RUNBOOKS]:
      "Navegar libros con el libro activo seleccionado",
    [KeyBinding.IMPORT_RUNBOOK]: "Abrir el diálogo de importación de libro",
    [KeyBinding.EXPORT]: "Abrir el diálogo de exportación",
    [KeyBinding.DELETE_RUNBOOK]: "Eliminar el libro enfocado de la biblioteca",
    [KeyBinding.CLEAR_LIBRARY]: "Abrir el diálogo de eliminar todos los libros",
    [KeyBinding.TOGGLE_EDITORS]: "Alternar todos los editores de comandos",
    [KeyBinding.MULTISELECT_BLOCKS]: "Selección múltiple de bloques",
    [KeyBinding.DUPLICATE_BLOCK]: "Duplicar bloques seleccionados",
    [KeyBinding.DELETE_BLOCK]: "Eliminar bloques seleccionados",
    [KeyBinding.OPEN_LINK]: "Abrir enlace de nota en una pestaña nueva",
    [KeyBinding.NOTE_BOLD]:
      "Poner en negrita el texto seleccionado (bloque de nota)",
    [KeyBinding.NOTE_ITALIC]:
      "Poner en cursiva el texto seleccionado (bloque de nota)",
    [KeyBinding.NOTE_CODE]:
      "Envolver el texto seleccionado en comillas invertidas (bloque de nota)",
    [KeyBinding.WRAP_SELECTION]:
      "Envolver el texto seleccionado en el par escrito (cualquier campo de texto)",
    [KeyBinding.SUBMIT_EDITOR]: "Guardar / crear desde un editor de código",
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
      subtitle: "Una herramienta pequeña para una molestia de todos los días.",
      items: [
        {
          title: "Cámbialo una vez",
          body: "Actualiza un host o una versión en un solo sitio. Cada comando que lo menciona se pone al día.",
        },
        {
          title: "Copia y ejecuta",
          body: "Cada `{VARIABLE}` se resuelve mientras escribes: lo que copias es el comando real.",
        },
        {
          title: "Se lee como una guía",
          body: "Notas en Markdown y separadores entre comandos, para que un libro siga teniendo sentido meses después.",
        },
        {
          title: "Todo en tu equipo",
          body: "Sin backend, sin cuenta, sin analíticas. Todo vive en tu navegador.",
        },
        {
          title: "Sin estorbarte",
          body: "Pestañas, reordenar arrastrando, modo lectura, atajos, tema claro y oscuro. Detalles que simplemente funcionan.",
        },
        {
          title: "Tuyo para llevar",
          body: "Exporta a JSON, Markdown o texto plano y vuelve a cargarlo donde quieras.",
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
    updated: "Última actualización: 2 de agosto de 2026",
    intro:
      "CommandPad es una aplicación del lado del cliente que funciona por completo en tu navegador. Esta política explica qué datos maneja la app y, más importante aún, cuáles no.",
    sections: [
      {
        heading: "La versión corta",
        paragraphs: [
          "CommandPad no tiene servidor backend, ni cuentas de usuario, ni analítica o seguimiento. La app no recopila, transmite ni vende ninguno de tus datos. Todo lo que creas se queda en tu dispositivo, salvo que elijas sincronizar un libro con tu propia cuenta de OneDrive o Google Drive.",
        ],
      },
      {
        heading: "Qué datos se almacenan",
        paragraphs: [
          "Todos los datos que introduces, como variables, comandos, notas y libros, se guardan localmente en tu navegador para que tu trabajo siga ahí cuando vuelvas.",
        ],
        bullets: `* **localStorage** guarda tus preferencias (tema, idioma, disposición) y metadatos ligeros de las pestañas.
* **IndexedDB** guarda el contenido real de los libros (tus variables y bloques de comandos).`,
      },
      {
        heading: "Imágenes",
        paragraphs: [
          "Un bloque de imagen guarda una imagen de dos formas posibles, y ninguna de ellas sube nada. **No hay servidor de imágenes, ni punto de subida, ni alojamiento de imágenes operado por nosotros.**",
        ],
        bullets: `* Una imagen **adjunta** (arrastrada, pegada o elegida con el selector de archivos) la lee tu navegador en tu propio dispositivo y se guarda como texto dentro del libro, junto al resto de su contenido. El archivo nunca se envía a ningún sitio.
* Una imagen **enlazada** es solo una dirección que escribiste. No se guarda ni se sube nada, pero tu navegador descarga la imagen del sitio que la aloja, así que ese sitio ve la petición igual que la vería en cualquier página que muestre la imagen.
* Si sincronizas un libro con tu propia cuenta en la nube, sus imágenes adjuntas viajan con él a esa cuenta, igual que cualquier otra parte del libro.`,
      },
      {
        heading: "Qué no hacemos",
        paragraphs: [
          "Queremos ser explícitos sobre las cosas que CommandPad evita deliberadamente.",
        ],
        bullets: `* No operamos un servidor backend que reciba tus datos. La única vez que tus libros salen de tu dispositivo es cuando los exportas o los sincronizas explícitamente con tu propia cuenta en la nube.
* No usamos cookies, identificadores publicitarios ni analítica de terceros.
* No seguimos tu comportamiento entre sitios ni construimos un perfil sobre ti.
* No requerimos una cuenta de CommandPad, un correo electrónico ni ningún inicio de sesión para usar la app.`,
      },
      {
        heading: "Sincronización en la nube (opcional)",
        paragraphs: [
          "CommandPad puede, de forma opcional, exportar un libro a tu propia cuenta de OneDrive o Google Drive, o importar uno desde ella. Esta función está desactivada hasta que elijas usarla.",
        ],
        bullets: `* Inicias sesión mediante el propio flujo del proveedor (Microsoft o Google). CommandPad nunca ve tu contraseña y solo solicita acceso a la carpeta dedicada **CommandPad** que crea para tus libros.
* Los libros sincronizados se guardan en esa carpeta dentro de tu propia cuenta. No se envían ni se almacenan en ningún servidor operado por nosotros.
* Los datos que sincronizas viajan entre tu navegador y el proveedor que elijas. Una vez que llegan a ese proveedor, se aplican su política de privacidad y sus términos.
* Puedes cerrar sesión en cualquier momento y puedes eliminar los archivos sincronizados directamente desde tu cuenta en la nube.`,
      },
      {
        heading: "Variables secretas",
        paragraphs: [
          "Marcar una variable como secreta siempre la enmascara en la interfaz. Cifrar el valor en el almacenamiento es un paso aparte y opcional: pon una frase de contraseña a un libro y sus valores secretos se cifran en el almacenamiento local, en las exportaciones JSON y en las copias sincronizadas en la nube. Sin una frase de contraseña, un valor secreto se sigue guardando en texto plano, y la frase nunca se guarda, así que una perdida no se puede recuperar.",
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
    updated: "Última actualización: 2 de agosto de 2026",
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
          "CommandPad es una herramienta gratuita del lado del cliente para crear libros de comandos con variables. Funciona en tu navegador y almacena tu trabajo localmente en tu dispositivo. De forma opcional, puede conectarse a tu propia cuenta de OneDrive o Google Drive para exportar e importar libros, totalmente a tu discreción. Se ofrece tal cual, y las funciones pueden cambiar o eliminarse con el tiempo.",
        ],
      },
      {
        heading: "Tus responsabilidades",
        paragraphs: [
          "Eres responsable de los comandos y del contenido que creas y de cómo los usas.",
        ],
        bullets: `* Revisa cada comando antes de ejecutarlo. CommandPad resuelve y copia texto; no ejecuta nada por ti.
* Mantén tus propias copias de seguridad de lo importante exportando tus libros.
* Adjunta solo imágenes que tengas derecho a usar. Una imagen adjunta pasa a formar parte del libro, así que va allá donde exportes o sincronices ese libro.
* Las variables secretas enmascaran su valor en pantalla y se pueden cifrar en el almacenamiento con una frase de contraseña; no sustituyen a un gestor de secretos dedicado.
* Usa la app cumpliendo las leyes y políticas que se te apliquen.`,
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
        heading: "Servicios de terceros en la nube",
        paragraphs: [
          "Si eliges sincronizar libros con OneDrive o Google Drive, lo haces a través de tu propia cuenta con Microsoft o Google. Tu uso de esos servicios se rige por sus términos y políticas de privacidad, no por los nuestros.",
        ],
        bullets: `* CommandPad solo accede a la carpeta dedicada que crea para tus libros; no lee el resto de tu almacenamiento en la nube.
* No somos responsables de la disponibilidad, el comportamiento ni el manejo de datos de Microsoft, Google o cualquier otro proveedor externo.
* Eres responsable de mantener segura tu cuenta en la nube y de cualquier contenido que almacenes en ella.`,
      },
      {
        heading: "Datos y privacidad",
        paragraphs: [
          "CommandPad almacena tus datos localmente y no los transmite, salvo cuando sincronizas explícitamente un libro con tu propia cuenta en la nube. Las imágenes que adjuntas no son una excepción: se leen en tu navegador y se guardan dentro del libro, y nunca se suben a ningún servidor operado por nosotros. Para más detalles, consulta la Política de Privacidad, que se incorpora a estos términos por referencia.",
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
      expandAll: "Expandir todas las secciones",
      collapseAll: "Contraer todas las secciones",
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
      [DocsSectionId.VARIABLE_SLICING]: "Recortar valores",
      [DocsSectionId.VARIABLE_COUNT]: "Contar caracteres",
      [DocsSectionId.VARIABLE_KEY]: "Usar el nombre de la variable",
      [DocsSectionId.VARIABLE_CASE]: "Mayúsculas y minúsculas",
      [DocsSectionId.VARIABLE_STRIP]: "Limpiar extremos",
      [DocsSectionId.UNNAMED_REFERENCES]: "Referencias sin variable",
      [DocsSectionId.VARIABLE_DATE]: "Fecha actual",
      [DocsSectionId.MULTILINE_REFERENCES]: "Referencias largas",
      [DocsSectionId.ESCAPING_BRACES]: "Escapar llaves",
      [DocsSectionId.SECRET_VARIABLES]: "Variables secretas",
      [DocsSectionId.SECRET_ENCRYPTION]: "Cifrar secretos",
      [DocsSectionId.BLOCKS]: "Bloques",
      [DocsSectionId.COMMAND_BLOCK]: "Bloque de comando",
      [DocsSectionId.NOTE_BLOCK]: "Bloque de nota",
      [DocsSectionId.IMAGE_BLOCK]: "Bloque de imagen",
      [DocsSectionId.DIVIDER_BLOCK]: "Bloque divisor",
      [DocsSectionId.MULTI_SELECT]: "Selección múltiple",
      [DocsSectionId.READ_MODE]: "Modo lectura",
      [DocsSectionId.EXPORT]: "Exportar",
      [DocsSectionId.CLOUD_EXPORT]: "Exportar e importar en la nube",
      [DocsSectionId.CLOUD_LINKED_SYNC]: "Mantener un libro sincronizado",
      [DocsSectionId.CLOUD_FILE_MANAGEMENT]: "Gestionar archivos en la nube",
      [DocsSectionId.LANGUAGE]: "Idioma",
      [DocsSectionId.KEYBOARD_SHORTCUTS]: "Atajos de teclado",
      [DocsSectionId.QA]: "Preguntas y respuestas",
    },
    demo: {
      tryIt: "Pruébalo",
      reset: "Reiniciar demo",
      tabSamples: {
        backup: {
          title: "Checklist de respaldo",
          note: "Ejecuta esto antes de apagar el equipo al terminar el día.",
        },
        siteCheck: {
          title: "Comprobación del sitio",
          note: "Ejecuta esto cuando el sitio se sienta lento.",
        },
      },
      runbookSamples: [
        "Checklist de release",
        "Respaldo de Postgres",
        "Depuración de K8s",
      ],
      multiSelectNotes: ["Crear la copia de seguridad", "Limpiar"],
      greetingTemplate: "¡Hola {;name}, bienvenido a {;place}!",
      commitSubject: "Corrige reintento en subidas fallidas",
      commitLengthCommand: 'echo "{message|count} de 50 caracteres usados"',
      projectName: "informe MENSUAL de ventas",
      reportFile: "ventas-mensuales.pdf",
      folderName: "   Informes de ventas   ",
      noteSample:
        "Haz clic en esta nota para ver su texto en bruto: mezcla **negrita**, _cursiva_, `código` y un enlace: https://example.com. Haz clic fuera para verla renderizada de nuevo.",
      tableSample: `| Código de salida | Significado | Acción |
| :---: | --- | --- |
| 126 | Permiso denegado | Dale permisos con \`chmod +x\` |
| 127 | Comando no encontrado | Revisa tu \`PATH\` |
| 137 | Terminado (sin memoria) | **Aumenta el límite de memoria** |`,
      listSample: `Antes de empezar:
* Cierra cualquier otra copia del archivo
* Guarda una copia de seguridad, por si acaso

Si algo sale mal, deshazlo en este orden:
1. Detén lo que estabas haciendo
2. Restaura la copia de seguridad
    1. Cópiala encima del original
    2. Ábrela para comprobar que está bien
3. Avisa a tu equipo de lo ocurrido`,
    },
    gettingStarted: {
      intro:
        "¡Bienvenido a CommandPad! Aquí vas a construir **libros de comandos**: documentos que mezclan los comandos que ejecutas a menudo con las notas que ayudan a explicarlos.",
      why: "Ya conoces el ritual: rebuscar en el historial de la terminal, escarbar en mensajes de chat antiguos o mantener un `comandos.txt` en alguna parte de tu computadora. Un libro de comandos acaba con eso. Cada comando vive junto a la nota que lo explica, con las partes que cambian ya rellenadas, listo para copiar.",
      journey:
        "Esta guía te acompaña paso a paso por cómo funciona la aplicación, para que le saques todo el provecho. Empezarás por los tipos de bloques con los que se construyen tus libros de comandos, luego las variables, la característica que hace que los bloques de comando sean realmente potentes, y para cerrar, el espacio de trabajo en sí: la barra lateral, las pestañas y todo lo que rodea a tus libros.",
      navigate:
        "Puedes leerla de principio a fin o saltar directo a lo que te interese desde el panel de contenidos que acompaña al artículo: tú eliges el ritmo. Al hacer clic en una entrada del índice te lleva a su sección y la pliega, y su título en el artículo hace lo mismo, así que puedes contraer lo que ya leíste y dejar el resto a la vista.",
      tryIt:
        "La mayoría de las secciones trae un ejemplo real y funcional marcado **Pruébalo**: una pieza de la app con la que puedes jugar, ya que nada de lo que hagas ahí toca tu espacio de trabajo real. Anímate a toquetear un poco, es la forma más rápida de entender cómo funciona algo. Si te pierdes, el botón de flecha en su esquina te devuelve al punto de partida.",
    },
    workspace: {
      intro:
        "El espacio de trabajo es la pantalla principal de la app, donde pasarás la mayor parte del tiempo armando y puliendo tus libros. Está formado por tres zonas:",
      items: `* La **cabecera**: reúne los botones con las acciones globales de la app.
* La **barra lateral**: contiene la biblioteca de libros y el panel de variables.
* El **panel principal**: aquí viven todos los libros que tengas abiertos, junto con sus bloques.`,
      persistence:
        "Todo lo que haces se guarda automáticamente en tu navegador y se restaura al recargar la página. Tus datos nunca se envían a un servidor.",
    },
    header: {
      intro:
        "La cabecera reúne las acciones que afectan a toda la app. De izquierda a derecha:",
      items: (
        exportLabel,
        collapseAllLabel,
      ) => `* El **logo de CommandPad**: haz clic en él para recargar la app.
* El **candado / lápiz**: alterna entre el modo lectura y el modo edición. Tiene su propia sección más adelante.
* **${collapseAllLabel}**: contrae o expande de golpe todos los editores de comandos del libro activo.
* El **sol / la luna**: cambia entre el tema claro y oscuro.
* El **selector de idioma**: cambia el idioma de la interfaz.
* El **libro**: abre esta documentación.
* La **flecha roja**: resetea el espacio de trabajo. Lo borra todo, así que la app siempre te pide confirmación antes.
* **${exportLabel}**: guarda el libro activo en un archivo. También tiene su propia sección más adelante.`,
    },
    mainPanel: {
      intro: (newBlockLabel) =>
        `El panel principal es tu mesa de trabajo. Arriba está la **barra de pestañas** con tus libros abiertos; debajo, los bloques del libro activo; y al final, la fila **${newBlockLabel}** para seguir agregando contenido.`,
      minimap:
        "En el borde derecho vive el **minimapa**: una miniatura de los bloques reales del libro que reemplaza a la barra de desplazamiento. Haz clic o arrastra sobre él para saltar a cualquier punto de un libro. Haz **clic derecho** en cualquier parte del contenido del libro para abrir un pequeño menú donde puedes activarlo o desactivarlo, o moverlo al otro lado.",
    },
    tabs: {
      intro: "Cada pestaña contiene un libro abierto.",
      items: (
        openSourceLabel,
        openPreviewLabel,
      ) => `* **Haz clic** en una pestaña para cambiar a ella.
* **Arrastra** una pestaña para reordenarla.
* **Clic con la rueda** del ratón en una pestaña para cerrarla.
* **Haz clic** en el **+** al final de la barra de pestañas para abrir una pestaña nueva.
* **${openSourceLabel}**, al final de la barra de pestañas, cambia los bloques de abajo por el JSON del libro.
* **${openPreviewLabel}** devuelve los bloques.`,
      autoCreate:
        "Si no hay pestañas abiertas y agregas un bloque o una variable, se crea automáticamente una pestaña nueva sin título.",
      labelDemo:
        "Una pestaña toma su nombre a partir del primer bloque de nota de su libro. Míralo en vivo abajo: la nota pertenece a la pestaña activa, y editarla renombra la pestaña mientras escribes. Pruébalo todo aquí: agrega una pestaña con el **+**, arrástralas, cambia entre ellas, cierra alguna, y abre la fuente para ver el libro de una pestaña como JSON.",
    },
    sidebar: {
      intro:
        "La barra lateral contiene la biblioteca de libros y el panel de variables.",
      items: `* **Contraer / expandir**: haz clic en el botón de flecha o usa su atajo de teclado.
* **Mover a izquierda / derecha**: haz clic en el botón de disposición para mover la barra lateral al otro lado de la pantalla.
* **Redimensionar**: arrastra el borde interior de la barra lateral; doble clic para contraerla.`,
      resizeDetails:
        "Arrastrar la barra lateral hasta dejarla muy estrecha la contrae por completo, y nunca puede crecer más allá de la mitad de la pantalla. Si la habías ensanchado, el doble clic en su borde la devuelve a su ancho normal. Al expandir una barra contraída también vuelve a ese ancho normal.",
    },
    runbookLibrary: {
      intro: (runbooksTitle) =>
        `La sección **${runbooksTitle}** de la barra lateral contiene tus libros importados.`,
      items: (
        importLabel,
        clearLibraryLabel,
        runbookActionsLabel,
      ) => `* Haz clic en **${importLabel}** para cargar uno o varios archivos \`.json\` a la vez, o en **Pegar** para crear un libro desde JSON en bruto.
* También puedes **arrastrar archivos** desde tu explorador de archivos y soltarlos sobre la sección para importarlos.
* Haz clic en cualquier libro para abrirlo. Si ya está abierto en una pestaña, esa pestaña pasará a estar activa.
* Abre el menú de **${runbookActionsLabel}** que aparece al pasar el cursor sobre la fila para duplicar un libro o quitarlo de la biblioteca.
* Haz clic en **${clearLibraryLabel}** para vaciar la biblioteca completa de una vez.
* Arrastra el control a la izquierda de un libro para reordenarlo en la lista.
* Usa la **barra de búsqueda** para filtrar libros por su etiqueta o nombre de archivo.`,
      autoLabel:
        "**Etiquetado automático:** si el primer bloque de un libro es una nota, su texto se usa como etiqueta en la biblioteca. En caso contrario se usa el nombre del archivo importado.",
      labelDetails:
        "Las etiquetas se normalizan: se limpia el formato markdown y se recorta hasta 60 caracteres.",
      autoSave:
        "Los cambios hechos al libro activo se guardan automáticamente en la biblioteca.",
    },
    variables: {
      why: "Esta es la característica sobre la que gira todo lo demás. Un nombre de servidor, una ruta, un número de versión: los mismos valores se repiten una y otra vez en los comandos que usas, y el día que uno cambia, toca corregirlo comando por comando. Con las variables defines ese valor **una vez**, y todos los comandos se actualizan solos.",
      intro:
        "Cada variable tiene una **clave** y un **valor**. Las claves distinguen mayúsculas de minúsculas. Si dos variables comparten la misma clave, gana la definida en último lugar.",
      usage:
        "Usa una variable en cualquier comando envolviendo su clave en llaves, p. ej. `{CLAVE}`. Renombrar una clave actualiza todos los comandos que la usan, y las variables que ningún comando usa se atenúan para que detectes las que ya no necesitas.",
      extract: (extractLabel) =>
        `No hace falta escribir una variable a mano. Selecciona cualquier parte de un comando en su editor, haz clic derecho (o pulsa \`Ctrl+.\`) y elige **${extractLabel}**: el texto seleccionado se convierte en una variable nueva, y el comando conserva en su lugar una referencia a ella. Su nombre propuesto queda seleccionado ahí mismo en el editor, así que basta con escribir encima para renombrarla. Pruébalo en la demo de arriba.`,
      unresolved:
        "Si un comando referencia una clave que no existe, o una variable con valor vacío, esa parte se resalta como **sin resolver**.",
      tooltip:
        "Si una clave o un valor no cabe en su casilla, pasa el cursor sobre ella para ver el texto completo en un tooltip.",
      split:
        "Las claves y los valores se reparten la fila en partes iguales, pero puedes cambiarlo: arrastra el divisor entre ambos para dar más espacio a uno de los lados, y haz doble clic para volver al reparto equitativo. El nuevo reparto se aplica a todas las variables y se recuerda entre sesiones.",
      demoHint: (variableActionsLabel) =>
        `Compruébalo abajo: una sola variable alimenta dos comandos. Edita su valor y mira cómo las dos vistas previas cambian mientras escribes. Pasa el cursor sobre una fila para revelar sus controles: un control de arrastre a la izquierda para reordenarla con otras variables, y un menú de **${variableActionsLabel}** a la derecha para duplicarla o eliminarla.`,
      constants:
        "No todas las variables cambian por el mismo motivo. Unas son valores que cambias a cada rato y otras son **constantes**: se mantienen igual durante toda la vida del libro, y solo son variables porque ese mismo valor aparece en comando tras comando. CommandPad las distingue por convención de nombres: una clave escrita entera en **mayúsculas** se considera una _constante_ y cualquier clave con alguna **minúscula** se considera _variable_.",
      constantsDemoHint:
        "La convención es solo de nombres: las constantes se resuelven, se referencian y se renombran igual que cualquier otra variable. Renombra abajo una clave de mayúsculas a minúsculas y al revés para ver cómo el color la sigue.",
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
        "Un valor puede tener varios huecos. Dale a cada uno un nombre distinto y rellénalos todos en el mismo comando, separados por punto y coma:",
      nested:
        "Un hueco también puede rellenarse con otra variable. Así, un mismo valor puede rellenar el hueco de un comando y usarse por su cuenta en otro:",
    },
    variableSlicing: {
      intro:
        "Una variable guarda un valor, pero no siempre se necesita entero. Por ejemplo, un hash de commit ocupa cuarenta caracteres al hacer checkout y solo siete en una etiqueta. Con el recorte mantienes **una única** variable y usas solo la parte que necesitas.",
      demoHint:
        "El primer comando usa el hash completo; el segundo, solo sus siete primeros caracteres. Edita la variable y verás cómo los dos se actualizan a la vez:",
      howItWorks:
        "Escribe un `|` después de la clave y luego `slice(...)` con la parte que quieres, con sus números separados por punto y coma. Se cuenta desde cero, y el segundo número indica dónde **parar sin llegar a incluirlo**: `slice(;7)` son los siete primeros caracteres y `slice(2;5)` son el dos, el tres y el cuatro. Omite cualquiera de los dos números para llegar desde el mismísimo principio, o hasta el final.",
      positionsHint:
        "Los números negativos cuentan desde el final, así que `slice(-2;)` son los dos últimos caracteres. Con una fecha se ven las tres formas de un vistazo:",
      step: "Un tercer número es el **paso**: cuántas posiciones salta el recorte entre un carácter y el siguiente. `slice(;;2)` toma un carácter de cada dos y se salta el resto, y un paso negativo avanza hacia atrás, así que `slice(;;-1)` por sí solo invierte un valor:",
      math: "Cada número también puede ser una cuenta sencilla: escribe `+` o `-` entre números enteros y se resuelven de izquierda a derecha.",
      invalid:
        "Si un recorte no tiene sentido, por ejemplo con un paso de cero, la referencia entera se queda **sin resolver** y aparece tal cual la escribiste, así que el error se nota enseguida. En cambio, pedir más caracteres de los que hay no es problema: obtienes los que existan.",
      python:
        "La forma de contar viene de Python, por si quieres leer más sobre ella: [recorte de cadenas en Python](https://www.geeksforgeeks.org/python/string-slicing-in-python/). No necesitas saber Python para usarla aquí.",
    },
    variableCount: {
      intro:
        "Escribe `count` después del `|` y obtienes **cuántos caracteres ocupa el valor**.",
      demoHint:
        "Por ejemplo, el asunto de un commit debería quedarse por debajo de 50 caracteres, pero nadie los cuenta a mano. Escribe en el mensaje de abajo y mira cómo el número te sigue:",
      chaining:
        "Las operaciones se aplican de izquierda a derecha, así que puedes poner `count` después de un recorte: `{commit|slice(;7)|count}` acorta el commit primero y luego cuenta lo que queda.",
    },
    variableKey: {
      intro:
        "A veces un comando necesita decir el nombre de una variable además de usar su valor. Escribe `key` después del `|` y obtienes **el nombre que le pusiste a la variable**, en vez de lo que guarda.",
      demoHint:
        "Cambia el nombre de la variable de abajo y mira cómo el comando se actualiza solo, el nombre y el valor nunca se desincronizan:",
      chaining:
        "Ignora el valor por completo, así que nada de lo que guarde la variable puede cambiar lo que obtienes.",
    },
    variableCase: {
      intro:
        "Escribe una palabra clave después del `|` y el valor se reescribe antes de llegar al comando. Cada resultado de la tabla está escrito con el estilo que nombra:",
      table: `| Operación | Resultado |
| --- | --- |
| \`snakecase\` | palabras\\_unidas\\_por\\_guiones\\_bajos |
| \`kebabcase\` | palabras-unidas-por-guiones |
| \`camelcase\` | palabrasUnidasPorMayúsculas |
| \`pascalcase\` | LoMismoEmpezandoPorMayúscula |
| \`capitalize\` | Solo la primera letra del valor |
| \`title\` | La Primera Letra De Cada Palabra |
| \`uppercase\` | TODAS LAS LETRAS EN MAYÚSCULA |
| \`lowercase\` | sin ninguna mayúscula |
| \`swapcase\` | tODAS LAS LETRAS AL REVÉS |`,
      rebuild:
        "Las cuatro primeras **reconstruyen** el valor a partir de sus palabras, así que los espacios desaparecen. Las demás solo cambian letras.",
      demoHint:
        "Por ejemplo, el nombre de una carpeta va mejor sin espacios; un título, con ellos. Observa abajo el mismo valor, de las dos formas:",
      renameHint: (renameCaseLabel) =>
        `Estas mismas conversiones también renombran la clave de una variable: abre el menú de acciones de una variable y elige **${renameCaseLabel}** para reescribir la clave; cada comando que la referencia se actualiza junto con ella.`,
    },
    variableStrip: {
      intro:
        "La operación `strip(valor)` quita el texto pasado entre paréntesis por los dos extremos del valor; `lstrip` lo quita solo por delante, y `rstrip` solo por detrás. Abajo, cada una sobre un valor rodeado de guiones:",
      table: `| Operación | Resultado |
| --- | --- |
| \`lstrip(-)\` | sin guiones por delante--- |
| \`rstrip(-)\` | ---sin guiones por detrás |
| \`strip(-)\` | sin guiones por los dos lados |`,
      demoHint:
        "Abajo se muestra una dirección copiada del navegador y un archivo que ya trae su extensión. Cambia cualquiera de los dos y los comandos se ajustan solos:",
      repeats:
        "El texto se quita tantas veces como aparezca, y se compara **entero**: `rstrip(valor)` nunca se lleva una `r` suelta.",
      whitespace:
        "Por defecto, las operaciones `strip` escritas sin paréntesis quitan los espacios en blanco:",
    },
    unnamedReferences: {
      intro:
        "Una referencia no necesita nombrar ninguna variable. Omite el nombre, escribe solo operaciones después de `|`, y la referencia partirá de un valor vacío: el resultado será lo que esas operaciones produzcan.",
      demoHint:
        "El `{|count}` de abajo no tiene ninguna variable detrás, así que no hay nada que contar y siempre da `0`:",
      rule: "Las llaves deben incluir al menos una operación. Unas llaves vacías se dejan tal cual, así que un comando que ya usa `{}` por su cuenta no se ve afectado.",
      anywhere:
        "Por sí solo no sirve de mucho, pero la siguiente operación le saca todo el partido a este mismo truco.",
    },
    variableDate: {
      intro:
        "Escribe `date` después de `|` y obtienes **la fecha actual**, con el formato `YYYY-MM-DD`. Sustituye lo que reciba, así que casi siempre se escribe sola, sin nada delante.",
      demoHint: "Con eso ya tienes la fecha de hoy interpolada en un nombre:",
      format:
        "Escribe un formato entre paréntesis para dar la fecha de otra forma. Cada marcador de abajo se rellena con su valor y todo lo demás se deja tal cual lo escribas, así que los separadores los eliges tú:",
      table: `| Marcador | Significado |
| --- | --- |
| \`YYYY\` | Año con cuatro cifras |
| \`YY\` | Las dos últimas cifras del año |
| \`MM\` | Mes, de 01 a 12 |
| \`DD\` | Día del mes, de 01 a 31 |
| \`HH\` | Hora, de 00 a 23 |
| \`mm\` | Minutos, de 00 a 59 |
| \`ss\` | Segundos, de 00 a 59 |`,
      formatDemoHint: (resetDemoLabel) =>
        `La fecha se calcula justo cuando se muestra el comando, no cuando se escribió. Pulsa **${resetDemoLabel}** un par de veces y verás cómo cambian los segundos:`,
      clock:
        "Usa tu propio reloj y tu propia zona horaria, así que un runbook que se queda abierto toda la noche mostrará mañana la fecha de mañana.",
    },
    multilineReferences: {
      intro:
        "Muchas veces las referencias se vuelven demasiado largas para leerlas en una sola línea. Puedes repartirlas en tantas líneas como quieras: los espacios y saltos de línea que rodean cada parte se ignoran, así que la distribuyes como prefieras.",
    },
    escapingBraces: {
      intro:
        "Antepón una barra invertida (`\\`) a una referencia en un bloque de comando para mostrarla literalmente en vez de resolverla.",
      tryHint:
        "Prueba a borrar la barra invertida del comando de abajo y mira cómo las llaves literales se convierten en una referencia activa:",
      scope: "El escape solo aplica dentro de bloques de comando.",
    },
    secretVariables: {
      intro: (actionsLabel, maskLabel) =>
        `Abre el menú **${actionsLabel}** de una variable y elige **${maskLabel}** para marcarla como **secreta**. Aparecerá entonces un **icono de ojo** en la fila que puedes pulsar para volver a mostrarla.`,
      copyNote:
        "El enmascarado es puramente visual: el botón **Copiar** siempre pone el valor **real** en tu portapapeles, así que tus comandos siguen funcionando. Pruébalo abajo, y haz clic en el icono de ojo para mostrar el valor.",
    },
    secretEncryption: {
      intro:
        "Enmascarar solo oculta un valor en pantalla. Cifrar lo protege donde se guarda: en el disco, en un `.json` exportado, en un archivo enlazado en la nube. Cada libro tiene su propia frase de contraseña; desbloquear uno no dice nada de otro.",
      passphrase: (createLabel) =>
        `Marca tu primer secreto y CommandPad te pide una frase de contraseña mediante **${createLabel}**. Nunca sale de tu dispositivo ni se guarda: CommandPad la convierte en una clave, la usa durante la sesión y olvida ambas al cerrar la pestaña. Si la pierdes no hay forma de recuperarla, así que rechazar el aviso solo deja el valor en claro, como antes.`,
      covered:
        "Solo se cifran los valores secretos; el resto sigue en texto plano, así que un libro exportado se puede seguir leyendo y comparando. En el disco, un secreto se ve como `cpv1.<sal>.<iv>.<cifrado>`: una etiqueta más todo lo necesario para descifrarlo salvo tu frase de contraseña, por eso el archivo se abre en cualquier máquina que la tenga.",
      unlocking:
        "Volver a abrir la pestaña bloquea todos los libros de nuevo, pero solo el que tienes delante te pide desbloquearlo; los demás esperan a que los abras. Un escudo junto al nombre del libro muestra su estado: verde y cerrado si está desbloqueado, neutro si está bloqueado, tachado si nada lo protege. Haz clic para desbloquearlo o para ponerle una frase de contraseña.",
      changing: (changeLabel) =>
        `Haz clic en un escudo desbloqueado para abrir **${changeLabel}**: escribe la frase de contraseña actual y luego la nueva dos veces. Todos los secretos de ese libro, incluida su copia en un archivo enlazado de la nube, se cifran de nuevo al momento. Los demás libros y los archivos ya exportados conservan la anterior.`,
      markdownWarning:
        "Las exportaciones a Markdown y texto plano también cifran el valor de un secreto, así que un comando que lo referencia incluye el texto cifrado en vez del valor real y no se puede ejecutar tal cual se exportó.",
    },
    blocks: {
      intro: (blockActionsLabel) =>
        `Los bloques son el contenido principal de un libro. Pasa el cursor sobre cualquier bloque para revelar sus controles: agarra el control de la izquierda para arrastrarlo a otro sitio, o abre el menú de **${blockActionsLabel}** de la derecha para insertar un bloque nuevo encima o debajo, duplicarlo o eliminarlo. Cada bloque tiene una anchura mínima que le impide encogerse hasta volverse ilegible.`,
    },
    commandBlock: {
      intro:
        "Es un bloque que guarda un comando que quieras tener a mano. Tiene dos partes:",
      parts: `* **Vista previa** (siempre visible): el comando exactamente como se copiará. Haz clic en su botón de **Copiar** para enviarlo a tu portapapeles. Este botón se deshabilita si el comando está vacío.
* **Editor** (contraíble): donde escribes el comando. Usa el botón de flecha para ocultarlo cuando solo necesites la vista previa.`,
      multiline:
        "Los comandos pueden ocupar varias líneas, y el editor se puede scrollear hacia los lados cuando una línea es muy larga. El margen izquierdo marca la primera línea con `$` y numera las siguientes.",
      editorFeatures:
        "El editor es un editor de código completo. `Ctrl+F` busca texto, `Alt+Arriba` y `Alt+Abajo` mueven una línea, `Ctrl+Shift+K` la elimina, `Alt+Clic` añade otro cursor, etc.",
      longCommands: (showMoreLines) =>
        `Un comando muy largo no estira el bloque para siempre. Cuando una parte pasa su límite de altura se detiene ahí y se desvanece, con un control **${showMoreLines}** debajo. Haz clic para revelar el resto, y haz clic otra vez para volver a plegarlo. La vista previa y el editor se limitan por separado, así que puedes abrir uno sin abrir el otro.`,
      variablesTeaser:
        "Los bloques de comando se vuelven mucho más útiles con las **variables**, que rellenan las partes de un comando que cambian. Se explican un poco más adelante, en su propia sección.",
    },
    noteBlock: {
      intro:
        "Es un bloque de texto libre. Las notas se expanden a lo alto y a lo ancho mientras escribes.",
      styles: (heading, subheading, body) =>
        `Hay tres estilos de texto seleccionables al pasar el cursor: **${heading}** (grande, en negrita), **${subheading}** (mediano, acentuado) y **${body}** (la prosa por defecto).`,
      markdown: "Las notas soportan formato markdown:",
      markdownTable: `| Sintaxis | Resultado |
| --- | --- |
| \\**texto-en-negrita\\** | **texto-en-negrita** |
| \\_texto-en-cursiva\\_ | _texto-en-cursiva_ |
| \\\`texto-de-código\\\` | \`texto-de-código\` |
| \\[enlace-con-etiqueta](\\https://example.com) | [enlace-con-etiqueta](https://example.com) |`,
      escapes:
        "Antepón una barra invertida (`\\`) a una marca de markdown para que se muestre literal en vez de aplicarse: escribir `\\**texto\\**` deja los asteriscos a la vista en lugar de poner el texto en negrita. Escapa los dos extremos de la marca, uno por uno, y ten en cuenta que dentro de un `código` no se escapa nada, porque ahí la barra invertida ya forma parte del contenido.",
      spellcheck: (spellcheckLabel) =>
        `Las notas se pueden corregir ortográficamente mientras las escribes. Haz **clic derecho** en cualquier parte del contenido del libro y activa **${spellcheckLabel}** en el menú.`,
      tables:
        "Las notas también soportan [tablas markdown al estilo GitHub](https://docs.github.com/es/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables): celdas separadas por barras `|`, con una fila de guiones debajo del encabezado. Haz clic en la nota de abajo para ver la sintaxis en bruto.",
      lists:
        "Las listas funcionan igual: empieza una línea con `*` o `-` para una viñeta, o con un número y un punto para un paso numerado. Sangra una línea para anidarla bajo el elemento anterior. Cada elemento ocupa una sola línea, así que la lista termina en la primera línea que no empiece por un marcador.",
      noNesting:
        "Los estilos no se combinan: por ejemplo, negrita y cursiva no pueden mezclarse en las mismas palabras. Gana el estilo que empiece primero.",
      links:
        "Las URLs sueltas se detectan automáticamente y se convierten en enlaces clicables. Para abrir un enlace, mantén `Ctrl` y haz clic en él.",
      wrapKeys:
        "Con texto seleccionado en una nota, `Ctrl+B` lo envuelve en negrita, `Ctrl+I` en cursiva y `Ctrl+´` en comillas invertidas; escribir cualquier carácter de paréntesis (**(**, **[** o **{**) o comillas (**\"** o **'**) lo envuelve en ese par. Envolver en pares no es exclusivo de las notas: funciona igual en el editor de comandos.",
    },
    imageBlock: {
      intro:
        "Es un bloque que guarda una imagen: el diagrama de la arquitectura, una captura de la pantalla que deberías estar viendo, el panel del tablero que confirma que el despliegue salió bien, etc.",
      ways: (
        chooseLabel,
      ) => `* **Suéltala**: arrastra un archivo de imagen desde tu escritorio directamente sobre el bloque.
* **Pégala**: haz clic en el bloque y pulsa \`Ctrl+V\` con una imagen, o una dirección de imagen, en el portapapeles.
* **Elígela**: pulsa **${chooseLabel}** para abrir el explorador de archivos.
* **Enlázala**: escribe o pega una dirección \`http\` o \`https\` en la casilla de abajo del bloque.`,
      attachedVsLinked: (limit) =>
        `Una imagen adjunta debe pesar menos de **${limit}**. Una imagen puesta a través de un enlace solo la mostrará mientras esta siga alojada en internet.`,
      sizing:
        "Una imagen se muestra con su mismo tamaño, pero nunca por debajo de un mínimo legible ni más allá de lo que permite el bloque: una imagen diminuta se amplía, una enorme se reduce, y ninguna se deforma.",
      slideshow:
        "Cuando un libro tiene más de una imagen, la pantalla completa se convierte en un pase de diapositivas: las flechas fijas en los bordes izquierdo y derecho de la pantalla, o las teclas `Izquierda` y `Derecha`, recorren todas las imágenes del libro en el orden en que aparecen, y el contador indica en cuál estás. La página acompaña el recorrido y deja cada imagen en la parte superior de la pantalla, para que así al cerrar la pantalla completa te quedes justo en la última que miraste.",
      demoHint: (viewFullscreen, replace, remove) =>
        `Pasa el cursor sobre una imagen para revelar sus controles: **${viewFullscreen}** la abre sobre la página atenuada, y su menú de acciones tiene **${replace}**, que cambia la foto sin tocar el bloque, y **${remove}**, que lo vacía y devuelve la zona para soltar.`,
    },
    dividerBlock: {
      intro:
        "No es más que un separador visual. Se estira hasta igualar el ancho del bloque más ancho, lo que lo hace perfecto para dividir un libro en secciones.",
      demoNote: "Escribe aquí y observa cómo el divisor crece o se encoge.",
    },
    multiSelect: {
      intro:
        "Mantén `Shift` y haz clic en bloques para construir una selección. También puedes mantener `Shift` y arrastrar el ratón sobre los bloques para seleccionarlos con un lazo. Lazar bloques ya seleccionados los deselecciona.",
      actions: `* **Arrastra** el control de cualquier bloque seleccionado para mover todos los bloques seleccionados juntos, conservando el orden relativo.
* **Duplicar**: \`Ctrl+D\` duplica el grupo completo, insertado después del último bloque seleccionado.
* **Eliminar**: \`Del\` elimina el grupo completo.
* **Copiar a otra pestaña**: arrastra el control de cualquier bloque seleccionado sobre una pestaña para copiar toda la selección dentro de ella. Las variables referenciadas viajan con los bloques; si la pestaña de destino ya define alguna con un valor distinto, la copia se añade con un nuevo nombre y los bloques copiados se reescriben para referenciarla, de modo que no se tocan los valores de ninguna pestaña.`,
      clear:
        "Pulsa `Escape` o haz clic fuera de los controles de bloque para limpiar la selección.",
      dragToTabDelay:
        "Mientras arrastras bloques sobre la barra de pestañas, mantén el cursor un momento sobre una pestaña para cambiar a ella, y luego suelta.",
    },
    readMode: {
      intro:
        "El modo lectura bloquea la edición, no la navegación. Haz clic en el **icono de candado** de la cabecera para activarlo:",
      rules: `* Todos los editores de comandos se contraen y no pueden expandirse.
* El texto de bloques y notas no puede editarse.
* La estructura de bloques no puede cambiarse (sin agregar, eliminar ni reordenar).
* Los valores de las variables sí pueden cambiarse.
* Los libros sí pueden abrirse.
* Los enlaces se pueden abrir con un clic directo.
* Las imágenes se abren a pantalla completa con un clic.`,
      persisted:
        "Este modo forma parte de tus preferencias guardadas, así que recargar la app te mantiene en modo lectura.",
      exit: "Haz clic en el **icono de lápiz** para volver al modo edición.",
    },
    export: {
      intro: (exportLabel) =>
        `Haz clic en **${exportLabel}** en la cabecera para abrir el selector de formato.`,
      formats: `* **JSON**: el espacio de trabajo completo (variables y bloques). Puede reimportarse.
* **Markdown**: un archivo \`.md\` legible con títulos, subtítulos, divisores, comandos resueltos e imágenes.
* **Texto plano**: el mismo contenido que Markdown, guardado como \`.txt\`.`,
      saveDialog:
        "En navegadores compatibles se abre un diálogo nativo de guardado para elegir nombre y carpeta. En los demás, el archivo se descarga directamente.",
      copyMarkdown: (copyMarkdownLabel) =>
        `También puedes hacer clic derecho dentro de un libro y elegir **${copyMarkdownLabel}** para evitar pasar por el proceso de exportación. Esta opción te permite copiar el contenido de un libro listo para pegarlo en un chat, un ticket o un documento.`,
    },
    cloudExport: {
      intro: (exportLabel, importLabel) =>
        `**${exportLabel}** e **${importLabel}** pueden ir directamente a OneDrive o Google Drive, no solo a este dispositivo. El diálogo se vuelve a abrir con el destino y el formato que usaste la última vez ya seleccionados.`,
      switchProvider:
        "Mientras exploras la nube, el nombre del proveedor en el título del diálogo es un **selector**: haz clic en él para cambiar entre proveedores.",
      overwrite:
        "Si la carpeta de destino ya tiene un archivo con el mismo nombre, la exportación se detiene y te pide confirmación antes de reemplazarlo.",
    },
    cloudLinkedSync: {
      intro:
        "Un libro que importas desde la nube queda **sincronizado** con el archivo del que vino: cada edición se escribe de vuelta en ese archivo, así que nunca tienes que volver a exportarlo para guardarlo. Exportar un libro como **JSON** lo vincula igual.",
      syncBadge: (runbooksTitle) =>
        `Un libro sincronizado muestra un **icono de sincronización** junto a su nombre en la lista de **${runbooksTitle}**: gira mientras una edición va en camino, y se convierte en una nube tachada si el guardado falló. Haz clic en él para volver a iniciar sesión o reintentar.`,
      stopSyncing: (stopSyncingLabel) =>
        `**${stopSyncingLabel}** (en el menú de tres puntos del libro) rompe el vínculo sin tocar ninguna de las dos copias. La sincronización solo sube tus ediciones locales, nunca baja los cambios remotos.`,
    },
    cloudFileManagement: {
      folders:
        "Los libros en la nube pueden vivir en carpetas: haz clic en una para abrirla y en un archivo para importarlo. Los botones de **flecha** y la ruta sobre la lista te mueven entre las carpetas que visitaste. Al exportar, el destino se elige igual, con un botón de **nueva carpeta**.",
      search:
        "La **barra de búsqueda** revisa la carpeta **CommandPad** entera, no solo la que tengas abierta, y muestra la ruta de cada resultado.",
      actions: (rename, edit, duplicate, download, deleteLabel) =>
        `El menú de **tres puntos** de una fila tiene **${rename}**, **${edit}**, **${duplicate}**, **${download}** y **${deleteLabel}**.`,
      multiSelect:
        "Las filas se seleccionan como los archivos de un explorador. Haz clic en una fila para seleccionarla, en el **círculo** de su izquierda para sumarla o quitarla de la selección, `Ctrl`+clic para lo mismo en cualquier punto de la fila y `Shift`+clic para tomar todo lo que hay entre la última fila que tocaste y esta. El círculo de la cabecera suma o quita las filas que estén listadas, y hacer clic en el espacio vacío bajo las filas vacía la selección.",
      bulkActions:
        "Con dos o más filas seleccionadas, una acción del menú se aplica a toda la selección, e importar, duplicar, descargar o eliminar esa cantidad de elementos te pide confirmación primero, enumerando exactamente lo que va a tocar. Una sola fila sigue actuando con un clic.",
      editFile:
        "**Editar** abre el JSON del archivo en el sitio, así que un arreglo rápido ya no implica importar, cambiar y volver a exportar. Tiene que seguir siendo JSON válido para guardarse.",
      recycleBin:
        "Un archivo o carpeta eliminado no se pierde para siempre: los proveedores de nube lo mueven primero a una _Papelera de reciclaje_.",
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
            "Expórtalo como **JSON** e importa el archivo en la otra máquina, o hazlo directamente a OneDrive o Google Drive y luego impórtalo desde ahí en la otra máquina. La exportación JSON contiene el espacio de trabajo completo (variables y bloques) y siempre puede reimportarse.",
        },
        {
          question: "¿Qué elimina exactamente Resetear el Espacio de Trabajo?",
          answer:
            "Todo: cada pestaña, cada libro de la biblioteca, cada variable y cada preferencia. Es un borrado completo del almacenamiento local de la app y no se puede deshacer, así que exporta antes lo que quieras salvar.",
        },
        {
          question: "¿Por qué parte de mi comando aparece resaltada en rojo?",
          answer:
            "Esa parte es una referencia sin resolver: no existe ninguna variable con esa clave (las claves distinguen mayúsculas de minúsculas), o a un marcador `{;nombre}` no se le dio valor.",
        },
        {
          question: "¿Las variables secretas están cifradas?",
          answer:
            "Solo si pones una frase de contraseña a ese libro, desde su icono de escudo en la biblioteca. Marcar una variable como secreta siempre la oculta en pantalla; sin una frase de contraseña, el valor se sigue guardando en texto plano.",
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
