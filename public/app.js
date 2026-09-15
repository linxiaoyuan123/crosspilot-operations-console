const ICON_PATHS = {
  overview: '<path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-11h6V4h-6v5Z"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  heading: '<path d="M5 5v14M19 5v14M5 12h14"/>',
  bold: '<path d="M7 5h6a4 4 0 0 1 0 8H7zM7 13h7a3 3 0 0 1 0 6H7z"/>',
  italic: '<path d="M10 5h8M6 19h8M14 5 10 19"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  orderedList: '<path d="M10 6h10M10 12h10M10 18h10M4 5h1v3M4 11h2l-2 3h2M4 17h2v3H4"/>',
  quote: '<path d="M7 17H4v-5a5 5 0 0 1 5-5v3a2 2 0 0 0-2 2h0v5Zm10 0h-3v-5a5 5 0 0 1 5-5v3a2 2 0 0 0-2 2h0v5Z"/>',
  code: '<path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5 17 5-5 3 3 2-2 4 4"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  save: '<path d="M4 4h13l3 3v13H4zM8 4v6h8V4M8 20v-6h8v6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  tools: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  music: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  volume: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h2a7 7 0 0 0 0-9h-2Z"/><circle cx="7.5" cy="10.5" r=".8"/><circle cx="10" cy="6.8" r=".8"/><circle cx="14.5" cy="6.8" r=".8"/><circle cx="17" cy="10" r=".8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.3 15.2A8.5 8.5 0 0 1 8.8 3.7a9 9 0 1 0 11.5 11.5Z"/>',
  monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  wallpaper: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5 17 5-5 3 3 2-2 4 4"/>',
  sparkles: '<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13Z"/>',
  rows: '<rect x="4" y="5" width="16" height="4" rx="1"/><rect x="4" y="15" width="16" height="4" rx="1"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  type: '<path d="M4 6h16M9 6v13M15 6v13M7 19h4M13 19h4"/>',
  images: '<rect x="3" y="5" width="13" height="11" rx="2"/><path d="M8 20h11a2 2 0 0 0 2-2V9"/><path d="m5 13 3-3 2 2 3-4 3 5"/>',
  waves: '<path d="M3 8c3 0 3 3 6 3s3-3 6-3 3 3 6 3M3 15c3 0 3 3 6 3s3-3 6-3 3 3 6 3"/>',
  gradient: '<path d="M4 4h16v16H4z"/><path d="m4 16 16-12M4 20 20 8"/>',
  flower: '<circle cx="12" cy="12" r="2.2"/><path d="M12 3c2.6 0 4 2.2 2.8 4.4M21 12c0 2.6-2.2 4-4.4 2.8M12 21c-2.6 0-4-2.2-2.8-4.4M3 12c0-2.6 2.2-4 4.4-2.8M7.8 4.7c1.7-1.8 4.1-1.4 4.8.9M19.3 7.8c1.8 1.7 1.4 4.1-.9 4.8M16.2 19.3c-1.7 1.8-4.1 1.4-4.8-.9M4.7 16.2c-1.8-1.7-1.4-4.1.9-4.8"/>',
  imports: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  listings: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5M8 17h3"/><path d="m15 16 2 2 3-4"/>',
  ads: '<path d="m3 11 18-5v12L3 13v-2Z"/><path d="M7 13v5a2 2 0 0 0 4 0v-4"/>',
  inventory: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7v10l8 4 8-4V7M12 11v10"/>',
  aftersales: '<path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 9h8M8 13h5"/>',
  reviews: '<path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/>',
  alert: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  search: '<circle cx="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/>',
  upload: '<path d="M12 15V3m0 0 4 4m-4-4L8 7"/><path d="M4 15v4h16v-4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4Z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6Z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M21 12h-3"/>',
  box: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7v10l8 4 8-4V7M12 11v10"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  chart: '<path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-7"/>',
  message: '<path d="M4 5h16v11H8l-4 4V5Z"/><path d="M8 9h8M8 12h5"/>',
  file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h4"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'
  // Filled variants intentionally override the baseline outline icons above.
  ,music: '<path d="M7.175 19.825Q6 18.65 6 17t1.175-2.825T10 13q.575 0 1.063.138t.937.412V4q0-.425.288-.712T13 3h4q.425 0 .713.288T18 4v2q0 .425-.288.713T17 7h-3v10q0 1.65-1.175 2.825T10 21t-2.825-1.175"/>'
  ,play: '<path d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475-.112.475-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712"/>'
  ,pause: '<path d="M16 19q-.825 0-1.412-.587T14 17V7q0-.825.588-1.412T16 5t1.413.588T18 7v10q0 .825-.587 1.413T16 19m-8 0q-.825 0-1.412-.587T6 17V7q0-.825.588-1.412T8 5t1.413.588T10 7v10q0 .825-.587 1.413T8 19"/>'
  ,palette: '<path d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12q0-2.075.813-3.9t2.2-3.175T8.25 2.788T12.2 2q2 0 3.775.688t3.113 1.9t2.125 2.875T22 11.05q0 2.875-1.75 4.413T16 17h-1.85q-.225 0-.312.125t-.088.275q0 .3.375.863t.375 1.287q0 1.25-.687 1.85T12 22m-4.425-9.425Q8 12.15 8 11.5t-.425-1.075T6.5 10t-1.075.425T5 11.5t.425 1.075T6.5 13t1.075-.425m3-4Q11 8.15 11 7.5t-.425-1.075T9.5 6t-1.075.425T8 7.5t.425 1.075T9.5 9t1.075-.425m5 0Q16 8.15 16 7.5t-.425-1.075T14.5 6t-1.075.425T13 7.5t.425 1.075T14.5 9t1.075-.425m3 4Q19 12.15 19 11.5t-.425-1.075T17.5 10t-1.075.425T16 11.5t.425 1.075T17.5 13t1.075-.425M12 20q.225 0 .363-.125t.137-.325q0-.35-.375-.825T11.75 17.3q0-1.05.725-1.675T14.25 15H16q1.65 0 2.825-.962T20 11.05q0-3.025-2.312-5.038T12.2 4Q8.8 4 6.4 6.325T4 12q0 3.325 2.338 5.663T12 20"/>'
  ,sun: '<path d="M11 3V2q0-.425.288-.712T12 1t.713.288T13 2v1q0 .425-.288.713T12 4t-.712-.288T11 3m0 19v-1q0-.425.288-.712T12 20t.713.288T13 21v1q0 .425-.288.713T12 23t-.712-.288T11 22m11-9h-1q-.425 0-.712-.288T20 12t.288-.712T21 11h1q.425 0 .713.288T23 12t-.288.713T22 13M3 13H2q-.425 0-.712-.288T1 12t.288-.712T2 11h1q.425 0 .713.288T4 12t-.288.713T3 13m16.75-7.325l-.35.35q-.275.275-.687.275T18 6q-.275-.275-.288-.687t.263-.713l.375-.375q.275-.3.7-.3t.725.3t.288.725t-.313.725M6.025 19.4l-.375.375q-.275.3-.7.3t-.725-.3t-.288-.725t.313-.725l.35-.35q.275-.275.688-.275T6 18q.275.275.288.688t-.263.712m12.3.35l-.35-.35q-.275-.275-.275-.687T18 18q.275-.275.688-.287t.712.262l.375.375q.3.275.3.7t-.3.725t-.725.288t-.725-.313M4.6 6.025l-.375-.375q-.3-.275-.3-.7t.3-.725t.725-.288t.725.313l.35.35q.275.275.275.688T6 6q-.275.275-.687.288T4.6 6.025M7.75 16.25Q6 14.5 6 12t1.75-4.25T12 6t4.25 1.75T18 12t-1.75 4.25T12 18t-4.25-1.75m7.088-1.412Q16 13.675 16 12t-1.162-2.838T12 8T9.162 9.163T8 12t1.163 2.838T12 16t2.838-1.162M12 12"/>'
  ,moon: '<path d="M12 21q-3.775 0-6.387-2.613T3 12q0-3.45 2.25-5.988T11 3.05q.325-.05.575.088t.4.362t.163.525t-.188.575q-.425.65-.638 1.375T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q.775 0 1.538-.225t1.362-.625q.275-.175.563-.162t.512.137q.25.125.388.375t.087.6q-.35 3.45-2.937 5.725T12 21m0-2q2.2 0 3.95-1.213t2.55-3.162q-.5.125-1 .2t-1 .075q-3.075 0-5.238-2.163T9.1 7.5q0-.5.075-1t.2-1q-1.95.8-3.163 2.55T5 12q0 2.9 2.05 4.95T12 19m-.25-6.75"/>'
  ,monitor: '<path d="M10.2 13.7h3.65l.625 1.825q.075.2.263.338t.412.137q.375 0 .588-.312t.087-.663l-2.85-7.55q-.075-.225-.275-.35T12.275 7h-.55q-.225 0-.425.125t-.275.35L8.175 15q-.125.35.088.675t.612.325q.25 0 .438-.137t.262-.363zm.45-1.3l1.3-3.75h.1l1.3 3.75zm-2 7.6H6q-.825 0-1.412-.587T4 18v-2.65L2.075 13.4q-.275-.3-.425-.662T1.5 12t.15-.737t.425-.663L4 8.65V6q0-.825.588-1.412T6 4h2.65l1.95-1.925q.3-.275.663-.425T12 1.5t.738.15t.662.425L15.35 4H18q.825 0 1.413.588T20 6v2.65l1.925 1.95q.275.3.425.663t.15.737t-.15.738t-.425.662L20 15.35V18q0 .825-.587 1.413T18 20h-2.65l-1.95 1.925q-.3.275-.662.425T12 22.5t-.737-.15t-.663-.425zm.85-2l2.5 2.5l2.5-2.5H18v-3.5l2.5-2.5L18 9.5V6h-3.5L12 3.5L9.5 6H6v3.5L3.5 12L6 14.5V18zm2.5-6"/>'
  ,wallpaper: '<path d="M5 21q-.825 0-1.412-.587T3 19v-6h2v6h6v2zm8 0v-2h6v-6h2v6q0 .825-.587 1.413T19 21zm-7-4l3-4l2.25 3l3-4L18 17zm-3-6V5q0-.825.588-1.412T5 3h6v2H5v6zm16 0V5h-6V3h6q.825 0 1.413.588T21 5v6zm-4.575-1.425Q14 9.15 14 8.5t.425-1.075T15.5 7t1.075.425T17 8.5t-.425 1.075T15.5 10t-1.075-.425"/>'
  ,imageOutline: '<path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zm1-2h12l-3.75-5l-3 4L9 13zm-1 2V5z"/>'
  ,overlay: '<path d="M4 21q-.825 0-1.412-.587T2 19V8q0-.425.288-.712T3 7t.713.288T4 8v11h14q.425 0 .713.288T19 20t-.288.713T18 21zm4-4q-.825 0-1.412-.587T6 15V4q0-.425.288-.712T7 3h15q.425 0 .713.288T23 4v11q0 .825-.587 1.413T21 17zm0-2h13V5H8zm3-3h2q.425 0 .713-.288T14 11V8q0-.425-.288-.712T13 7h-2q-.425 0-.712.288T10 8v3q0 .425.288.713T11 12m5 0h2q.425 0 .713-.288T19 11t-.288-.712T18 10h-2q-.425 0-.712.288T15 11t.288.713T16 12m0-3h2q.425 0 .713-.288T19 8t-.288-.712T18 7h-2q-.425 0-.712.288T15 8t.288.713T16 9m-8 6V5z"/>'
  ,hideImage: '<path d="m21 18.15l-2-2V5H7.85l-2-2H19q.825 0 1.413.588T21 5zm-1.2 4.45L18.2 21H5q-.825 0-1.412-.587T3 19V5.8L1.4 4.2l1.4-1.4l18.4 18.4zM6 17l3-4l2.25 3l.825-1.1L5 7.825V19h11.175l-2-2zm4.6-3.6"/>'
  ,viewDay: '<path d="M3 20v-2h18v2zM3 6V4h18v2zm2 10q-.825 0-1.412-.587T3 14v-4q0-.825.588-1.412T5 8h14q.825 0 1.413.588T21 10v4q0 .825-.587 1.413T19 16zm0-2h14v-4H5zm0-4v4z"/>'
  ,desktopLandscape: '<path d="M7 16h7q.425 0 .713-.288T15 15v-3q0-.425-.288-.712T14 11H7q-.425 0-.712.288T6 12v3q0 .425.288.713T7 16m2.213-6.712q.212.212.537.212H16q.2 0 .35.15t.15.35v2.25q0 .325.213.538t.537.212t.538-.213t.212-.537V10q0-.825-.587-1.412T16 8H9.75q-.325 0-.537.213T9 8.75t.213.538M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V6H4zm0 0V6z"/>'
  ,titlecase: '<path d="M8.6 16.925V8.6H6.425q-.35 0-.588-.225T5.6 7.8t.237-.575T6.425 7H12.5q.35 0 .575.225t.225.575t-.225.575t-.575.225h-2.2v8.325q0 .35-.25.588t-.6.237t-.6-.238t-.25-.587m6.25-5.375h-.625q-.3 0-.512-.213t-.213-.512t.213-.512t.512-.213h.625V8.75q0-.35.238-.587t.587-.238t.588.238t.237.587v1.35h1.125q.3 0 .513.213t.212.512t-.213.513t-.512.212H16.5v3.7q0 .575.263.9t.712.325h.225q.275-.025.488.187t.212.513q0 .35-.187.55t-.513.25q-.125.025-.25.025h-.25q-1.1 0-1.725-.638T14.85 15.6z"/>'
  ,carousel: '<path d="M2 15V9q0-.825.588-1.412T4 7t1.413.588T6 9v6q0 .825-.587 1.413T4 17t-1.412-.587T2 15m7 4q-.825 0-1.412-.587T7 17V7q0-.825.588-1.412T9 5h6q.825 0 1.413.588T17 7v10q0 .825-.587 1.413T15 19zm9-4V9q0-.825.588-1.412T20 7t1.413.588T22 9v6q0 .825-.587 1.413T20 17t-1.412-.587T18 15m-9 2h6V7H9zm3-5"/>'
  ,airwave: '<path d="M18.75 8.65q-.675.675-1.55 1.025t-1.75.35t-1.725-.337T12.2 8.65l-1.875-1.875q-.375-.375-.85-.562T8.5 6.025t-.975.188t-.85.562L5.5 7.95q-.3.3-.7.288t-.7-.313t-.3-.712t.3-.713l1.15-1.15q.675-.675 1.525-1.012T8.5 4t1.713.337t1.512 1.013L13.6 7.225q.4.4.875.588T15.45 8t.988-.187t.887-.588L18.5 6.05q.3-.3.713-.3t.712.3t.3.713t-.3.712zm0 5q-.675.675-1.537 1.013T15.474 15t-1.737-.337T12.2 13.65l-1.875-1.875q-.375-.375-.85-.562t-.975-.188t-.975.188t-.85.562L5.5 12.95q-.275.275-.687.288T4.1 12.95q-.3-.275-.312-.7t.287-.725L5.25 10.35q.675-.675 1.525-1.012T8.5 9t1.713.338t1.512 1.012l1.875 1.875q.4.4.875.588t.975.187t.988-.187t.887-.588L18.5 11.05q.3-.3.713-.3t.712.3t.3.713t-.3.712zm-.025 5q-.675.675-1.525 1.013T15.475 20t-1.737-.337T12.2 18.65l-1.9-1.875q-.375-.375-.85-.562t-.975-.188t-.975.188t-.85.562L5.475 17.95q-.275.275-.687.288t-.713-.288q-.275-.275-.275-.7t.275-.7l1.175-1.2q.675-.675 1.525-1.012T8.5 14t1.713.338t1.512 1.012l1.875 1.875q.4.4.888.588t.987.187t.975-.187t.875-.588L18.5 16.05q.3-.3.7-.288t.7.313q.275.3.288.7t-.288.7z"/>'
  ,gradient: '<path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm6-10v2h2v-2zm-4 0v2h2v-2zm2 2v2h2v-2zm4 0v2h2v-2zm-8 0v2h2v-2zm10-2v2h2v2h2v-2h-2v-2zm-8 4v2H5v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h-2v-2h-2v2h-2v-2h-2v2H9v-2zm12-4v2zm0 4v2z"/>'
  ,flower: '<path d="M18.5 12A3.5 3.5 0 0 0 22 8.5A6.5 6.5 0 0 0 15.5 2A3.5 3.5 0 0 0 12 5.5A3.5 3.5 0 0 0 8.5 2A6.5 6.5 0 0 0 2 8.5A3.5 3.5 0 0 0 5.5 12A3.5 3.5 0 0 0 2 15.5A6.5 6.5 0 0 0 8.5 22a3.5 3.5 0 0 0 3.5-3.5a3.5 3.5 0 0 0 3.5 3.5a6.5 6.5 0 0 0 6.5-6.5a3.5 3.5 0 0 0-3.5-3.5M12 16a4 4 0 0 1-4-4a4 4 0 0 1 4-4a4 4 0 0 1 4 4a4 4 0 0 1-4 4m2.5-4a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 12A2.5 2.5 0 0 1 12 9.5a2.5 2.5 0 0 1 2.5 2.5"/>'
  ,search: '<path d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/>'
  ,borderOuter: '<path d="M11.288 8.713Q11 8.425 11 8t.288-.712T12 7t.713.288T13 8t-.288.713T12 9t-.712-.288m-4 4Q7 12.426 7 12t.288-.712T8 11t.713.288T9 12t-.288.713T8 13t-.712-.288m4 0Q11 12.426 11 12t.288-.712T12 11t.713.288T13 12t-.288.713T12 13t-.712-.288m4 0Q15 12.426 15 12t.288-.712T16 11t.713.288T17 12t-.288.713T16 13t-.712-.288m-4 4Q11 16.426 11 16t.288-.712T12 15t.713.288T13 16t-.288.713T12 17t-.712-.288M5 19h14V5H5zm0 2q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21z"/>'
};

const FILLED_ICONS = new Set(['music', 'play', 'pause', 'palette', 'sun', 'moon', 'monitor', 'wallpaper', 'imageOutline', 'overlay', 'hideImage', 'viewDay', 'desktopLandscape', 'titlecase', 'carousel', 'airwave', 'gradient', 'flower', 'search', 'borderOuter']);

const VIEW_META = {
  home: { title: '主页', eyebrow: 'CrossPilot 内容与运营总览' },
  articles: { title: '文章', eyebrow: '运营方法与项目记录' },
  article: { title: '文章详情', eyebrow: 'CrossPilot 阅读' },
  studio: { title: '内容后台', eyebrow: '文章维护与发布' },
  overview: { title: '运营总览', eyebrow: '经营驾驶舱' },
  imports: { title: '数据导入', eyebrow: '报表清洗与字段映射' },
  listings: { title: 'Listing与商品', eyebrow: '商品与内容优化' },
  ads: { title: '广告与流量', eyebrow: '搜索词与投放决策' },
  inventory: { title: '库存与履约', eyebrow: '补货与风险控制' },
  aftersales: { title: '售后与账号', eyebrow: '问题闭环与健康预警' },
  reviews: { title: '运营复盘', eyebrow: '周期总结与报告导出' }
};

const CONTENT_ROUTES = {
};

const ARTICLE_MODE_ROUTES = {
  all: '/articles',
  archive: '/archive',
  categories: '/categories',
  tags: '/tags',
  series: '/series',
  search: '/search'
};

const LEGACY_HASH_ROUTES = {
  home: '/',
  articles: '/articles',
  studio: '/studio',
  overview: '/overview',
  imports: '/imports',
  listings: '/listings',
  ads: '/ads',
  inventory: '/inventory',
  aftersales: '/aftersales',
  reviews: '/reviews'
};

const HERO_PHRASES = [
  '识别利润、广告与库存问题，不让异常停留在表格里。',
  '把报表映射成统一字段，把指标变成可执行动作。',
  '从 Listing 优化到补货决策，每一步都有证据可回写。',
  '用日报、周报和月报，让跨境运营形成真正的闭环。'
];

const STATUS_LABELS = {
  open: '待处理',
  in_progress: '处理中',
  deferred: '已延期',
  done: '已完成',
  closed: '已关闭',
  ignored: '已忽略',
  resolved: '已解决',
  waiting: '待外部反馈',
  healthy: '健康',
  warning: '预警',
  stockout: '缺货风险',
  overstock: '滞销风险',
  cancelled: '已取消',
  preview: '待确认',
  committed: '已入库'
};

const PRIORITY_LABELS = { critical: 'P0 紧急', high: 'P1 高', medium: 'P2 中', low: 'P3 低' };
const IMPORT_TARGET_FIELDS = {
  products: [
    ['sku', 'SKU'], ['title', '商品标题'], ['price', '售价'], ['unit_cost', '采购成本'],
    ['units_30d', '销量'], ['sales_30d', '销售额'], ['ad_spend_30d', '广告费'],
    ['ad_sales_30d', '广告销售'], ['returns_30d', '退货数量'], ['rating', '评分'], ['review_count', '评论数']
  ],
  ads: [
    ['sku', 'SKU'], ['campaign', '广告活动'], ['ad_group', '广告组'], ['search_term', '搜索词'],
    ['match_type', '匹配类型'], ['clicks', '点击量'], ['impressions', '曝光量'], ['spend', '花费'],
    ['ad_sales', '广告销售'], ['ad_orders', '广告订单']
  ],
  inventory: [
    ['sku', 'SKU'], ['snapshot_date', '快照日期'], ['available', '可售库存'], ['inbound', '在途库存'],
    ['reserved', '预留库存'], ['defective', '残次品'], ['avg_daily_sales', '日均销量'],
    ['last_restock_date', '最近补货日期'], ['note', '备注']
  ],
  after_sales: [
    ['sku', 'SKU'], ['case_no', '售后编号'], ['type', '问题类型'], ['subject', '主题'],
    ['reason', '原因'], ['detail', '详情'], ['status', '状态'], ['priority', '优先级'],
    ['owner', '负责人'], ['due_date', '截止日期'], ['evidence', '处理证据']
  ]
};

const state = {
  viewRequest: 0,
  view: 'home',
  storeId: null,
  stores: [],
  articles: [],
  articleStats: { total: 0, published: 0, drafts: 0, categories: [], tags: [] },
  homeQuery: '',
  articleQuery: '',
  articleMode: 'all',
  articleView: 'list',
  articleCategory: '',
  articleTag: '',
  articleMonth: '',
  articleSeries: '',
  articleArchive: [],
  articleSlug: '',
  currentArticle: null,
  studioTab: 'articles',
  studioEditingId: null,
  studioArticleForm: null,
  studioPreview: '',
  studioMedia: [],
  studioComments: [],
  studioContent: [],
  studioContentId: null,
  studioContentForm: null,
  overview: null,
  actions: [],
  imports: [],
  pendingImport: null,
  products: [],
  selectedProductId: null,
  ads: null,
  inventory: null,
  afterSales: null,
  knowledge: [],
  knowledgeQuery: '',
  productQuery: '',
  reviewTab: 'reports'
};

const app = document.querySelector('#app');
const pageTitle = document.querySelector('#page-title');
const pageEyebrow = document.querySelector('#page-eyebrow');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');
const fontToggle = document.querySelector('#font-toggle');
const appHeader = document.querySelector('.app-header');
const navProgress = document.querySelector('#nav-progress');
const heroTypewriter = document.querySelector('#hero-typewriter');
let heroTypewriterTimer = 0;
let heroTypewriterEnabled = null;
const shellLeft = document.querySelector('#shell-left');
const shellRight = document.querySelector('#shell-right');
let studioPreviewTimer = 0;
let studioPreviewRequest = 0;

init();

function init() {
  initPageTransitions();
  document.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icon(element.dataset.icon);
  });
  applyFontMode(readFontMode());
  initFontToggle();
  initSakura();
  initHeroTypewriter();
  initAppHeader();
  initNavTools();
  initStorePicker();
  window.addEventListener('crosspilot:navigate', (event) => {
    const view = event.detail?.view;
    if (VIEW_META[view]) navigate(view);
  });
  window.addEventListener('crosspilot:search-navigate', (event) => handleSearchNavigation(event.detail || {}));
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleChange);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('popstate', restoreViewFromLocation);
  const hashValue = window.location.hash.replace('#', '');
  if (hashValue.startsWith('article/')) {
    window.location.replace(`/articles/${encodeURIComponent(decodeURIComponent(hashValue.slice('article/'.length)))}`);
    return;
  }
  if (LEGACY_HASH_ROUTES[hashValue]) {
    const target = LEGACY_HASH_ROUTES[hashValue];
    window.history.replaceState({}, '', target);
  }
  restoreViewFromLocation();
  updateViewChrome();
  checkHealth();
  bootstrap();
}

function restoreViewFromLocation() {
  const hashValue = window.location.hash.replace('#', '');
  if (hashValue.startsWith('article/')) {
    window.location.replace(`/articles/${encodeURIComponent(decodeURIComponent(hashValue.slice('article/'.length)))}`);
    return;
  }
  if (LEGACY_HASH_ROUTES[hashValue]) {
    window.history.replaceState({}, '', LEGACY_HASH_ROUTES[hashValue]);
  }
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const articleDetailMatch = path.match(/^\/articles\/([^/]+)$/);
  const articleMode = Object.entries(ARTICLE_MODE_ROUTES).find(([, route]) => route === path)?.[0];
  const requestedStudioId = Number(params.get('edit')) || null;

  if (path === '/') {
    state.view = 'home';
  } else if (articleDetailMatch) {
    state.view = 'article';
    state.articleSlug = decodeURIComponent(articleDetailMatch[1]);
  } else if (articleMode) {
    state.view = 'articles';
    state.articleMode = articleMode;
    state.articleQuery = params.get('q') || '';
    state.articleCategory = params.get('category') || '';
    state.articleTag = params.get('tag') || '';
    state.articleSeries = params.get('series') || '';
    state.articleMonth = params.get('month') || '';
  } else if (path === '/studio') {
    state.view = 'studio';
    state.studioTab = 'articles';
    if (requestedStudioId) {
      state.studioEditingId = requestedStudioId;
      state.studioArticleForm = null;
    }
  } else {
    const operationView = Object.entries(LEGACY_HASH_ROUTES).find(([, route]) => route === path)?.[0];
    if (operationView && VIEW_META[operationView]) state.view = operationView;
  }
  updateViewChrome();
  if (state.stores.length) loadCurrentView(true);
}

async function bootstrap() {
  app.innerHTML = loadingTemplate('正在加载 CrossPilot 运营数据');
  try {
    const { items } = await api('/api/stores');
    state.stores = items;
    state.storeId = state.stores[0]?.id || null;
    renderStoreSwitcher();
    await loadCurrentView();
  } catch (error) {
    app.innerHTML = errorTemplate(error.message);
  }
}

async function loadCurrentView(force = false) {
  const request = ++state.viewRequest;
  if (!state.stores.length || force) {
    const { items } = await api('/api/stores');
    state.stores = items;
    if (!state.stores.some((store) => store.id === state.storeId)) state.storeId = state.stores[0]?.id || null;
    renderStoreSwitcher();
  }
  if (!state.storeId) return renderEmptyPage('还没有店铺数据', '请先准备 CrossPilot 演示数据库。');
  app.innerHTML = loadingTemplate('正在整理运营数据');
  try {
    if (state.view === 'overview') await loadOverview(request);
    if (state.view === 'home') await loadHome(request);
    if (state.view === 'articles') await loadArticles(request);
    if (state.view === 'article') await loadArticle(request);
    if (state.view === 'studio') await loadStudio(request);
    if (state.view === 'imports') await loadImports(request);
    if (state.view === 'listings') await loadListings(request);
    if (state.view === 'ads') await loadAds(request);
    if (state.view === 'inventory') await loadInventory(request);
    if (state.view === 'aftersales') await loadAfterSales(request);
    if (state.view === 'reviews') await loadReviews(request);
  } catch (error) {
    if (isCurrentViewRequest(request, state.view)) app.innerHTML = errorTemplate(error.message);
  }
  if (!isCurrentViewRequest(request, state.view)) return false;
  renderShellSidebars();
  return true;
}

function isCurrentViewRequest(request, view) {
  return request === state.viewRequest && view === state.view;
}

async function loadHome(request = state.viewRequest) {
  const view = state.view;
  const [overview, actions, articles] = await Promise.all([
    api(`/api/overview?storeId=${state.storeId}`),
    api(`/api/actions?storeId=${state.storeId}&status=all`),
    api('/api/knowledge?status=published&limit=12')
  ]);
  if (!isCurrentViewRequest(request, view) || view !== 'home') return;
  state.overview = overview;
  state.actions = actions.items;
  state.articles = articles.items;
  state.articleStats = articles.stats;
  renderHome();
}

async function loadArticles(request = state.viewRequest) {
  const view = state.view;
  const params = new URLSearchParams({ status: 'published', limit: '60' });
  if (state.articleQuery) params.set('q', state.articleQuery);
  if (state.articleCategory) params.set('category', state.articleCategory);
  if (state.articleTag) params.set('tag', state.articleTag);
  if (state.articleSeries) params.set('series', state.articleSeries);
  if (state.articleMonth) params.set('month', state.articleMonth);
  const [data, archive] = await Promise.all([
    api(`/api/knowledge?${params}`),
    state.articleMode === 'archive' && !state.articleArchive.length
      ? api('/api/knowledge/archive')
      : Promise.resolve(null)
  ]);
  if (!isCurrentViewRequest(request, view) || view !== 'articles') return;
  state.articles = data.items;
  state.articleStats = data.stats;
  if (archive) state.articleArchive = archive.items || [];
  renderArticles();
}

async function loadArticle(request = state.viewRequest) {
  const view = state.view;
  if (!state.articleSlug) {
    state.currentArticle = null;
    app.innerHTML = errorTemplate('文章地址无效');
    return;
  }
  const article = await api(`/api/knowledge/${encodeURIComponent(state.articleSlug)}`);
  if (!isCurrentViewRequest(request, view) || view !== 'article') return;
  state.currentArticle = article;
  updateViewChrome();
  renderArticleDetail();
}

async function loadStudio(request = state.viewRequest) {
  const view = state.view;
  if (!isCurrentViewRequest(request, view) || view !== 'studio') return;
  const [data, media, comments, content, overview, actions] = await Promise.all([
    api('/api/knowledge?status=all&limit=500'),
    api('/api/media?limit=200'),
    api('/api/comments?status=all&limit=300'),
    api('/api/content?status=all&limit=200'),
    api(`/api/overview?storeId=${state.storeId}`),
    api(`/api/actions?storeId=${state.storeId}&status=all`)
  ]);
  if (!isCurrentViewRequest(request, view) || view !== 'studio') return;
  state.articles = data.items;
  state.articleStats = data.stats;
  state.studioMedia = media.items || [];
  state.studioComments = comments.items || [];
  state.studioContent = content.items || [];
  state.overview = overview;
  state.actions = actions.items || [];
  if (!state.studioArticleForm) {
    const target = state.articles.find((item) => item.id === Number(state.studioEditingId)) || state.articles[0];
    if (target) selectStudioArticle(target, false);
    else resetStudioArticle(false);
  }
  if (!state.studioContentForm) {
    const target = state.studioContent.find((item) => item.id === Number(state.studioContentId)) || state.studioContent[0];
    if (target) {
      state.studioContentId = target.id;
      state.studioContentForm = contentToStudioForm(target);
    } else {
      state.studioContentId = null;
      state.studioContentForm = blankStudioContentForm();
    }
  }
  renderStudio();
  scheduleStudioPreview();
}

async function loadOverview(request = state.viewRequest) {
  const view = state.view;
  const [overview, actions] = await Promise.all([
    api(`/api/overview?storeId=${state.storeId}`),
    api(`/api/actions?storeId=${state.storeId}&status=all`)
  ]);
  if (!isCurrentViewRequest(request, view) || view !== 'overview') return;
  state.overview = overview;
  state.actions = actions.items;
  renderOverview();
}

async function loadImports(request = state.viewRequest) {
  const view = state.view;
  const { items } = await api(`/api/imports?storeId=${state.storeId}`);
  if (!isCurrentViewRequest(request, view) || view !== 'imports') return;
  state.imports = items;
  if (state.pendingImport && !items.some((item) => item.id === state.pendingImport.id && item.status === 'preview')) state.pendingImport = null;
  renderImports();
}

async function loadListings(request = state.viewRequest) {
  const view = state.view;
  const { items } = await api(`/api/products?storeId=${state.storeId}`);
  if (!isCurrentViewRequest(request, view) || view !== 'listings') return;
  state.products = items;
  if (!state.selectedProductId || !items.some((item) => item.id === state.selectedProductId)) state.selectedProductId = items[0]?.id || null;
  renderListings();
}

async function loadAds(request = state.viewRequest) {
  const view = state.view;
  const ads = await api(`/api/ads?storeId=${state.storeId}`);
  if (!isCurrentViewRequest(request, view) || view !== 'ads') return;
  state.ads = ads;
  renderAds();
}

async function loadInventory(request = state.viewRequest) {
  const view = state.view;
  const inventory = await api(`/api/inventory?storeId=${state.storeId}`);
  if (!isCurrentViewRequest(request, view) || view !== 'inventory') return;
  state.inventory = inventory;
  renderInventory();
}

async function loadAfterSales(request = state.viewRequest) {
  const view = state.view;
  const afterSales = await api(`/api/after-sales?storeId=${state.storeId}`);
  if (!isCurrentViewRequest(request, view) || view !== 'aftersales') return;
  state.afterSales = afterSales;
  renderAfterSales();
}

async function loadReviews(request = state.viewRequest) {
  const view = state.view;
  const [knowledge, overview] = await Promise.all([
    api(`/api/knowledge${state.knowledgeQuery ? `?q=${encodeURIComponent(state.knowledgeQuery)}` : ''}`),
    api(`/api/overview?storeId=${state.storeId}`)
  ]);
  if (!isCurrentViewRequest(request, view) || view !== 'reviews') return;
  state.knowledge = knowledge.items;
  state.overview = overview;
  renderReviews();
}

function renderHome() {
  const keyword = state.homeQuery.trim().toLowerCase();
  const visible = state.articles.filter((article) => { if (!keyword) return true; return `${article.title} ${article.excerpt} ${article.category} ${article.tags}`.toLowerCase().includes(keyword); });
  app.innerHTML = `
    <section class="home-intro cp-card" aria-labelledby="home-title">
      <div class="home-intro-copy">
        <span class="cp-kicker">CrossPilot journal</span>
        <h1 id="home-title">把跨境运营经验，整理成可以复用的方法</h1>
        <p>这里只保留文章与写作入口，经营指标、店铺状态和待办动作继续放在运营总览与工具模块。</p>
      </div>
      <div class="home-intro-actions">
        <button class="button secondary" type="button" data-nav="articles">${icon('book', 15)}全部文章</button>
        <button class="button primary" type="button" data-action="new-article">${icon('edit', 15)}写新文章</button>
      </div>
    </section>
    <section class="home-library cp-card" aria-labelledby="home-library-title">
      <header class="home-library-head">
        <div><span class="cp-kicker">latest notes</span><h2 id="home-library-title">最新文章</h2><p>按更新时间浏览运营方法、项目复盘和实战记录。</p></div>
        <form id="home-search-form" class="home-search">${icon('search', 15)}<input name="q" type="search" value="${escapeAttr(state.homeQuery)}" placeholder="筛选文章" aria-label="筛选文章"><button type="submit">搜索</button></form>
      </header>
      ${visible.length ? `<div class="home-feed">${visible.map(renderHomeStory).join('')}</div>` : emptyBlock('没有匹配文章', '调整筛选词后再试。')}
    </section>`;
}

function renderHomeStory(article, index) {
  const tags = String(article.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, index === 0 ? 4 : 2);
  return `<a class="home-story${index === 0 ? ' featured' : ''}" href="/articles/${encodeURIComponent(article.slug)}" data-article-slug="${escapeAttr(article.slug)}">
    <span class="home-story-copy">
      <span class="home-story-meta"><span>${h(article.category || '未分类')}</span>${article.featured ? '<strong>置顶</strong>' : ''}<time>${formatDate(article.updated_at)}</time></span>
      <h3>${h(article.title)}</h3>
      ${index === 0 ? `<p>${h(article.excerpt)}</p>` : ''}
      <span class="home-story-tags">${tags.map((tag) => `<span>#${h(tag)}</span>`).join('')}</span>
      <span class="home-story-foot"><span>${article.reading_minutes || 1} 分钟阅读</span><span>${number(article.views)} 次查看</span><em>继续阅读 ${icon('arrow', 13)}</em></span>
    </span>
    <span class="home-story-cover" aria-hidden="true">${article.cover_image ? `<img src="${escapeAttr(article.cover_image)}" alt="" loading="${index > 1 ? 'lazy' : 'eager'}">` : icon('book', 28)}</span>
  </a>`;
}

function renderArticleCard(article) {
  const tags = String(article.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 4);
  return `<article class="article cp-card">
    <a class="cover" href="/articles/${encodeURIComponent(article.slug)}" data-article-slug="${escapeAttr(article.slug)}" aria-label="阅读 ${escapeAttr(article.title)}">${article.cover_image ? `<img src="${escapeAttr(article.cover_image)}" alt="" loading="lazy">` : icon('book', 26)}</a>
    <div class="copy">
      <div class="meta-top"><span class="cp-kicker">${h(article.category || '未分类')}</span>${article.featured ? '<span class="cp-badge accent">置顶</span>' : ''}</div>
      <h2><a href="/articles/${encodeURIComponent(article.slug)}" data-article-slug="${escapeAttr(article.slug)}">${h(article.title)}</a></h2>
      <p>${h(article.excerpt)}</p>
      <div class="tags">${tags.map((tag) => `<button type="button" data-action="filter-tag" data-tag="${escapeAttr(tag)}">#${h(tag)}</button>`).join('')}</div>
      <div class="meta"><span>${formatDate(article.updated_at)}</span><span>${article.reading_minutes || 1} 分钟</span><span>${number(article.views)} 次查看</span></div>
    </div>
  </article>`;
}

function renderArticles() {
  const stats = state.articleStats || {};
  const title = { all: '全部文章', archive: '文章归档', categories: '文章分类', tags: '标签索引', series: '内容系列', search: '全文搜索' }[state.articleMode] || '全部文章';
  const filters = state.articleMode === 'categories' ? stats.categories : state.articleMode === 'tags' ? stats.tags : [];
  const series = state.articleMode === 'series' ? stats.series || [] : [];
  const modes = [['all', '全部'], ['categories', '分类'], ['tags', '标签'], ['archive', '归档'], ['series', '系列'], ['search', '搜索']];
  app.innerHTML = `
    <header class="page-head cp-card"><div><span class="cp-kicker">${state.articleMode === 'search' ? 'full text search' : 'content library'}</span><h1>${title}</h1><p>按文章本身阅读，不把店铺资料和经营指标混进内容区。</p></div><div class="page-head-actions"><button class="button secondary" type="button" data-nav="studio">${icon('edit', 14)}内容后台</button><button class="button primary" type="button" data-action="new-article">${icon('plus', 14)}写新文章</button></div></header>
    <nav class="cp-article-mode-tabs" aria-label="文章浏览方式">${modes.map(([mode, label]) => `<button type="button" class="${state.articleMode === mode ? 'is-active' : ''}" data-action="article-mode" data-mode="${mode}"${state.articleMode === mode ? ' aria-current="page"' : ''}>${label}</button>`).join('')}</nav>
    ${state.articleMode === 'all' || state.articleMode === 'search' ? `<form id="article-search-form" class="search-bar cp-card">${icon('search', 16)}<input class="cp-field" name="q" value="${escapeAttr(state.articleQuery)}" type="search" placeholder="搜索标题、正文、标签" aria-label="搜索文章"><button class="button secondary" type="submit">搜索</button></form>` : ''}
    ${filters.length ? `<div class="taxonomy cp-card"><div class="taxonomy-head">${icon('target', 15)}<strong>${state.articleMode === 'categories' ? '按分类筛选' : '按标签筛选'}</strong></div><div class="taxonomy-list">${filters.map((item) => `<button type="button" class="${(state.articleMode === 'categories' ? state.articleCategory : state.articleTag) === item.name ? 'active' : ''}" data-action="filter-${state.articleMode === 'categories' ? 'category' : 'tag'}" data-value="${escapeAttr(item.name)}">${h(item.name)}<span>${item.count}</span></button>`).join('')}</div></div>` : ''}
    ${series.length ? `<div class="series-grid">${series.map((item) => `<button type="button" class="series-card cp-card${state.articleSeries === item.slug ? ' active' : ''}" data-action="filter-series" data-value="${escapeAttr(item.slug)}"><span class="cp-kicker">series</span><h2>${h(item.name)}</h2><p>${h(item.description || '按顺序阅读这一主题下的文章。')}</p><strong>${item.count} 篇</strong></button>`).join('')}</div>` : ''}
    ${state.articleMode === 'archive' && state.articleArchive.length ? `<div class="archive-strip cp-card cp-scroll">${state.articleArchive.map((item) => `<button type="button" class="${state.articleMonth === item.month ? 'active' : ''}" data-action="toggle-month" data-value="${escapeAttr(item.month)}"><strong>${h(item.month)}</strong><span>${item.count} 篇</span></button>`).join('')}</div>` : ''}
    <div class="toolbar"><span>共显示 ${state.articles.length} 篇</span><div class="view-switch"><button type="button" class="${state.articleView === 'grid' ? 'active' : ''}" data-action="article-view" data-view="grid" title="网格视图">${icon('grid', 14)}</button><button type="button" class="${state.articleView === 'list' ? 'active' : ''}" data-action="article-view" data-view="list" title="列表视图">${icon('rows', 14)}</button></div></div>
    ${state.articles.length ? `<div class="article-list ${state.articleView}-view">${state.articles.map(renderArticleCard).join('')}</div>` : emptyBlock('没有匹配文章', '调整搜索或筛选条件后再试。')}`;
}

function renderArticleDetail() {
  const article = state.currentArticle;
  if (!article) {
    app.innerHTML = errorTemplate('文章不存在');
    return;
  }
  app.innerHTML = `
    <div class="cp-article-detail-actions"><button class="button secondary" data-action="back-articles">${icon('chevronLeft')}返回文章</button><button class="button secondary" data-action="edit-article" data-id="${article.id}">${icon('edit')}编辑本文</button></div>
    <article class="panel cp-reading-shell">
      ${article.cover_image ? `<div class="cp-reading-cover"><img src="${escapeAttr(article.cover_image)}" alt=""></div>` : ''}
      <header class="cp-reading-head"><span class="project-kicker">${h(article.category)}</span><h1>${h(article.title)}</h1><p>${h(article.excerpt)}</p><div class="cp-article-meta"><span>${formatDate(article.updated_at)}</span><span>${article.reading_minutes} 分钟阅读</span><span>${number(article.views)} 次查看</span></div></header>
      <div class="article-markdown">${article.html || ''}</div>
      <footer class="cp-reading-footer"><div class="cp-article-tags">${String(article.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => `<button type="button" data-action="filter-tag" data-tag="${escapeAttr(tag)}"># ${h(tag)}</button>`).join('')}</div><button class="button secondary" data-action="back-articles">${icon('book')}继续浏览文章</button></footer>
    </article>`;
}

const STUDIO_CONTENT_TYPES = {
  dynamic: '运营动态',
  project: '案例项目',
  gallery: '证据相册',
  resource: '资源导航',
  guestbook: '反馈留言',
  about: '关于页面'
};

const STUDIO_ARTICLE_STATUSES = {
  draft: { label: '草稿', tone: 'draft' },
  review: { label: '待审核', tone: 'review' },
  rejected: { label: '已驳回', tone: 'rejected' },
  pending: { label: '待发布', tone: 'pending' },
  published: { label: '已发布', tone: 'published' }
};

function studioArticleDisplayStatus(article = {}) {
  if (article.display_status && STUDIO_ARTICLE_STATUSES[article.display_status]) return article.display_status;
  if (article.review_status === 'rejected') return 'rejected';
  if (article.status === 'published') return article.publish_at && new Date(article.publish_at).getTime() > Date.now() ? 'pending' : 'published';
  return article.review_status === 'submitted' ? 'review' : 'draft';
}

function blankStudioArticleForm() {
  return {
    title: '',
    slug: '',
    category: '运营复盘',
    tags: '',
    excerpt: '',
    contentMd: '## 背景\n\n写下问题发生的场景。\n\n## 处理过程\n\n1. 第一步\n2. 第二步\n\n## 结论\n\n记录判断标准和结果。',
    coverImage: '',
    status: 'draft',
    reviewStatus: 'draft',
    displayStatus: 'draft',
    reviewNote: '',
    featured: false,
    publishAt: ''
  };
}

function blankStudioContentForm(type = 'dynamic') {
  return {
    type,
    slug: '',
    title: '',
    summary: '',
    contentMd: '',
    coverImage: '',
    metadataText: '{}',
    status: 'published',
    featured: false,
    publishedAt: ''
  };
}

function studioDateTime(value = '') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function articleToStudioForm(article) {
  return {
    title: article.title || '',
    slug: article.slug || '',
    category: article.category || '运营复盘',
    tags: article.tags || '',
    excerpt: article.excerpt || '',
    contentMd: article.content_md || '',
    coverImage: article.cover_image || '',
    status: article.status === 'published' ? 'published' : 'draft',
    reviewStatus: article.review_status === 'submitted' ? 'submitted' : 'draft',
    displayStatus: studioArticleDisplayStatus(article),
    reviewNote: article.review_note || '',
    featured: Boolean(article.featured),
    publishAt: studioDateTime(article.publish_at || '')
  };
}

function contentToStudioForm(item) {
  return {
    type: item.type || 'dynamic',
    slug: item.slug || '',
    title: item.title || '',
    summary: item.summary || '',
    contentMd: item.content_md || '',
    coverImage: item.cover_image || '',
    metadataText: JSON.stringify(item.metadata || {}, null, 2),
    status: item.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(item.featured),
    publishedAt: studioDateTime(item.published_at || '')
  };
}

function resetStudioArticle(render = true) {
  state.studioEditingId = null;
  state.studioArticleForm = blankStudioArticleForm();
  state.studioPreview = '';
  state.studioTab = 'articles';
  if (render) renderStudio();
}

function selectStudioArticle(article, render = true) {
  state.studioEditingId = article.id;
  state.studioArticleForm = articleToStudioForm(article);
  state.studioPreview = article.html || '';
  state.studioTab = 'articles';
  if (render) renderStudio();
}

function resetStudioContent(type = 'dynamic', render = true) {
  state.studioContentId = null;
  state.studioContentForm = blankStudioContentForm(type);
  if (render) renderStudio();
}

function selectStudioContent(item, render = true) {
  state.studioContentId = item.id;
  state.studioContentForm = contentToStudioForm(item);
  state.studioTab = 'structured';
  if (render) renderStudio();
}

function renderStudio() {
  const stats = state.articleStats || {};
  const tabs = [
    ['articles', '文章'],
    ['comments', '评论审核'],
    ['media', '媒体库'],
    ['structured', '内容模块']
  ];
  app.innerHTML = `
    <header class="page-head cp-card"><div><span class="cp-kicker">content studio</span><h1>内容后台</h1><p>文章、评论、媒体和结构化内容统一维护，正文支持 Markdown、拖拽上传与实时预览。</p></div><div class="page-head-actions"><button class="button secondary" type="button" data-nav="articles">${icon('eye', 14)}查看文章页</button><button class="button primary" type="button" data-action="studio-new-article">${icon('plus', 14)}新建文章</button></div></header>
    <div class="metric-grid cp-metric-grid cp-studio-stats">
      ${metricCard('book', '文章总数', String(stats.total || 0), '全部内容', null, 'accent')}
      ${metricCard('check', '已发布', String(stats.published || 0), '文章页可见', null, 'green')}
      ${metricCard('edit', '草稿', String(stats.drafts || 0), '仅后台可见', null, 'amber')}
      ${metricCard('check', '文章待审', String(stats.review || 0), '送审后等待处理', null, stats.review ? 'amber' : 'green')}
      ${metricCard('message', '留言待审', String(stats.comments?.pending || state.studioComments.filter((item) => item.status === 'pending').length), '读者留言', null, stats.comments?.pending ? 'amber' : 'green')}
    </div>
    <nav class="cp-article-mode-tabs cp-studio-tabs" aria-label="内容后台模块">${tabs.map(([tab, label]) => `<button type="button" class="${state.studioTab === tab ? 'is-active' : ''}" data-action="studio-tab" data-tab="${tab}"${state.studioTab === tab ? ' aria-current="page"' : ''}>${label}</button>`).join('')}</nav>
    ${state.studioTab === 'comments' ? renderStudioCommentsTab() : state.studioTab === 'media' ? renderStudioMediaTab() : state.studioTab === 'structured' ? renderStudioStructuredTab() : renderStudioArticlesTab()}`;
}

function renderStudioArticlesTab() {
  return `<div class="cp-studio-workbench">
    <aside class="panel cp-studio-sidebar">
      <header><div><span class="panel-kicker">article list</span><h3>文章清单</h3></div><span class="muted">${state.articles.length}</span></header>
      <div class="cp-studio-sidebar-list">${state.articles.length ? state.articles.map(renderStudioArticleItem).join('') : emptyBlock('还没有文章', '点击新建文章开始写作。')}</div>
    </aside>
    ${renderStudioArticleEditor()}
  </div>`;
}

function renderStudioArticleItem(article) {
  const status = studioArticleDisplayStatus(article);
  const statusMeta = STUDIO_ARTICLE_STATUSES[status] || STUDIO_ARTICLE_STATUSES.draft;
  return `<button type="button" class="cp-studio-sidebar-item${state.studioEditingId === article.id ? ' is-active' : ''}" data-action="studio-select-article" data-id="${article.id}">
    <span class="cp-studio-sidebar-dot is-${statusMeta.tone}"></span>
    <span><strong>${h(article.title)}</strong><small>${h(article.category || '未分类')} · ${h(statusMeta.label)} · ${formatDate(article.updated_at)}</small></span>
  </button>`;
}

function renderStudioArticleEditor() {
  const form = state.studioArticleForm || blankStudioArticleForm();
  const preview = state.studioPreview || '<p class="markdown-placeholder">Markdown 预览会显示在这里。</p>';
  const categories = (state.articleStats?.categories || []).map((item) => `<option value="${escapeAttr(item.name)}"></option>`).join('');
  const displayStatus = STUDIO_ARTICLE_STATUSES[form.displayStatus] ? form.displayStatus : 'draft';
  const statusMeta = STUDIO_ARTICLE_STATUSES[displayStatus];
  const isEditing = Boolean(state.studioEditingId);
  const canSubmitReview = isEditing && ['draft', 'rejected'].includes(displayStatus);
  const isInReview = isEditing && displayStatus === 'review';
  const isPublished = isEditing && displayStatus === 'published';
  const statusHint = displayStatus === 'review' ? '文章已锁定在审核队列，通过后可按定时时间发布。' : displayStatus === 'rejected' ? '根据驳回意见修改后，可重新保存并再次送审。' : displayStatus === 'pending' ? '审核已通过，定时发布时间到达后自动公开。' : displayStatus === 'published' ? '文章已公开，保存修改会直接更新前台内容。' : '保存草稿后即可送审，审核通过前不会出现在文章区。';
  return `<form id="studio-article-form" class="panel cp-studio-editor article-editor-form">
    <div class="cp-studio-editor-head"><div><span class="cp-kicker">${isEditing ? 'edit article' : 'new article'}</span><h2>${isEditing ? '编辑文章' : '新建文章'}</h2></div><div class="cp-studio-editor-actions">${isPublished ? `<button class="button secondary" type="button" data-action="studio-open-preview" data-slug="${escapeAttr(form.slug)}">${icon('eye', 14)}查看文章</button>` : ''}${isInReview ? `<button class="button secondary" type="submit" name="intent" value="approve">${icon('check', 14)}通过并发布</button><button class="button secondary cp-danger-button" type="submit" name="intent" value="reject">${icon('x', 14)}驳回</button>` : ''}${canSubmitReview ? `<button class="button secondary" type="submit" name="intent" value="submit-review">${icon('upload', 14)}送审</button>` : ''}${isPublished ? `<button class="button secondary" type="submit" name="intent" value="unpublish">${icon('edit', 14)}转为草稿</button>` : ''}${isEditing ? `<button class="button secondary cp-danger-button" type="button" data-action="studio-delete-article" data-id="${state.studioEditingId}">${icon('trash', 14)}删除</button>` : ''}</div></div>
    <div class="article-editor-meta">
      ${field('文章标题', `<input class="cp-field" name="title" value="${escapeAttr(form.title)}" maxlength="160" required>` , true)}
      ${field('URL 标识', `<input class="cp-field" name="slug" value="${escapeAttr(form.slug)}" maxlength="80" placeholder="留空自动生成">`)}
      ${field('分类', `<input class="cp-field" name="category" value="${escapeAttr(form.category)}" list="studio-category-options" maxlength="50"><datalist id="studio-category-options">${categories}</datalist>`)}
      ${field('标签', `<input class="cp-field" name="tags" value="${escapeAttr(form.tags)}" placeholder="用逗号分隔">`)}
      ${field('定时发布', `<input class="cp-field" name="publishAt" type="datetime-local" value="${escapeAttr(form.publishAt)}">`)}
      <label class="cp-check-field span-2"><input type="checkbox" name="featured"${form.featured ? ' checked' : ''}><span>设为主页置顶文章</span></label>
      ${field('摘要', `<textarea class="cp-field cp-scroll" name="excerpt" rows="3" maxlength="320">${h(form.excerpt)}</textarea>`, true)}
    </div>
    <div class="studio-review-strip is-${statusMeta.tone}"><span class="cp-kicker">review status</span><strong>${statusMeta.label}</strong><p>${statusHint}${form.reviewNote ? ` 驳回原因：${h(form.reviewNote)}` : ''}</p></div>
    <div class="cp-cover-editor">
      <div class="cp-cover-preview">${form.coverImage ? `<img src="${escapeAttr(form.coverImage)}" alt="">` : `<span>${icon('image', 24)}文章封面</span>`}</div>
      <input type="hidden" name="coverImage" value="${escapeAttr(form.coverImage)}">
      <div><strong>封面设置</strong><p>支持 PNG、JPG、WebP、GIF、AVIF，最大 5 MB。</p><div class="cp-studio-upload-actions"><label class="button secondary cp-upload-button">${icon('upload', 14)}上传封面<input id="studio-cover-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif"></label>${form.coverImage ? `<button class="button secondary" type="button" data-action="studio-clear-cover">${icon('trash', 14)}清空封面</button>` : ''}</div></div>
    </div>
    <div class="markdown-workbench">
      <div class="markdown-toolbar"><div class="markdown-toolbar-group">
        <button class="icon-button small" type="button" data-action="studio-format" data-format="heading" title="二级标题">${icon('heading', 15)}</button>
        <button class="icon-button small" type="button" data-action="studio-format" data-format="bold" title="粗体">${icon('bold', 15)}</button>
        <button class="icon-button small" type="button" data-action="studio-format" data-format="italic" title="斜体">${icon('italic', 15)}</button>
        <button class="icon-button small" type="button" data-action="studio-format" data-format="list" title="无序列表">${icon('list', 15)}</button>
        <button class="icon-button small" type="button" data-action="studio-format" data-format="orderedList" title="有序列表">${icon('orderedList', 15)}</button>
        <button class="icon-button small" type="button" data-action="studio-format" data-format="quote" title="引用">${icon('quote', 15)}</button>
        <button class="icon-button small" type="button" data-action="studio-format" data-format="link" title="链接">${icon('link', 15)}</button>
        <button class="icon-button small" type="button" data-action="studio-format" data-format="code" title="代码块">${icon('code', 15)}</button>
      </div><div class="markdown-toolbar-group"><label class="button secondary cp-upload-button">${icon('image', 14)}正文图片<input id="studio-body-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif"></label><button class="button secondary cp-editor-preview-button" type="button" data-action="studio-preview">${icon('eye', 14)}刷新预览</button></div></div>
      <div class="markdown-editor-grid"><label class="markdown-pane"><span>Markdown</span><textarea name="contentMd" spellcheck="false">${h(form.contentMd)}</textarea></label><div class="markdown-pane"><span>预览</span><div class="markdown-preview" data-studio-preview>${preview}</div></div></div>
    </div>
    <div class="article-editor-actions"><span>${isEditing ? `文章 ID ${state.studioEditingId}` : '保存后会生成新的文章 ID'}</span><button class="button primary" type="submit" name="intent" value="save">${icon('save', 14)}${isEditing ? '保存修改' : '保存草稿'}</button></div>
  </form>`;
}

function renderStudioCommentsTab() {
  const items = state.studioComments || [];
  const pending = items.filter((item) => item.status === 'pending').length;
  return `<section class="panel cp-studio-panel"><div class="panel-head"><div><span class="panel-kicker">moderation</span><h3>评论审核</h3></div><span class="muted">${pending} 条待审核</span></div><div class="cp-studio-comment-list">${items.length ? items.map((item) => `<article class="cp-studio-comment"><div><span class="badge status-${item.status === 'approved' ? 'healthy' : item.status === 'pending' ? 'warning' : 'failed'}">${item.status === 'approved' ? '已通过' : item.status === 'pending' ? '待审核' : '已拒绝'}</span><strong>${h(item.nickname || '匿名访客')}</strong><small>文章 #${item.article_id} · ${formatDateTime(item.created_at)}</small><p>${h(item.content)}</p></div><div class="cp-studio-comment-actions">${item.status !== 'approved' ? `<button class="button secondary" data-action="studio-comment" data-id="${item.id}" data-status="approved">${icon('check', 13)}通过</button>` : ''}${item.status !== 'rejected' ? `<button class="button secondary" data-action="studio-comment" data-id="${item.id}" data-status="rejected">拒绝</button>` : ''}<button class="button secondary cp-danger-button" data-action="studio-delete-comment" data-id="${item.id}">${icon('trash', 13)}删除</button></div></article>`).join('') : emptyBlock('还没有评论', '文章页收到的留言会显示在这里。')}</div></section>`;
}

function renderStudioMediaTab() {
  const items = state.studioMedia || [];
  return `<section class="panel cp-studio-panel"><div class="panel-head"><div><span class="panel-kicker">media library</span><h3>媒体库</h3></div><span class="muted">${items.length} 个文件</span></div><div class="cp-studio-media-grid">${items.length ? items.map((item) => `<article><img src="${escapeAttr(item.url)}" alt="" loading="lazy"><div><strong>${h(item.filename)}</strong><small>${number(Math.round((Number(item.size) || 0) / 1024))} KB · ${formatDate(item.created_at)}</small></div><button class="button secondary" data-action="studio-copy-media" data-url="${escapeAttr(item.url)}">${icon('file', 13)}复制地址</button></article>`).join('') : emptyBlock('还没有上传图片', '文章封面和正文图片会显示在这里。')}</div></section>`;
}

function renderStudioStructuredTab() {
  const items = state.studioContent || [];
  const form = state.studioContentForm || blankStudioContentForm();
  const typeOptions = Object.entries(STUDIO_CONTENT_TYPES).map(([value, label]) => `<option value="${value}"${form.type === value ? ' selected' : ''}>${h(label)}</option>`).join('');
  return `<div class="cp-studio-workbench cp-studio-structured-layout"><aside class="panel cp-studio-sidebar"><header><div><span class="panel-kicker">structured content</span><h3>内容模块</h3></div><button class="button primary" data-action="studio-new-content">${icon('plus', 13)}新建</button></header><div class="cp-studio-sidebar-list">${items.length ? items.map((item) => `<button type="button" class="cp-studio-sidebar-item${state.studioContentId === item.id ? ' is-active' : ''}" data-action="studio-select-content" data-id="${item.id}"><span class="cp-studio-sidebar-dot ${item.status === 'published' ? 'is-published' : ''}"></span><span><strong>${h(item.title)}</strong><small>${h(STUDIO_CONTENT_TYPES[item.type] || item.type)} · ${formatDate(item.updated_at)}</small></span></button>`).join('') : emptyBlock('还没有内容模块', '点击新建开始创建。')}</div></aside><form id="studio-content-form" class="panel cp-studio-editor article-editor-form"><div class="cp-studio-editor-head"><div><span class="cp-kicker">${state.studioContentId ? 'edit module' : 'new module'}</span><h2>${state.studioContentId ? '编辑内容模块' : '新建内容模块'}</h2></div><div class="cp-studio-editor-actions">${state.studioContentId ? `<button class="button secondary cp-danger-button" type="button" data-action="studio-delete-content" data-id="${state.studioContentId}">${icon('trash', 13)}删除</button>` : ''}<button class="button primary" type="submit">${icon('save', 13)}保存内容</button></div></div><div class="article-editor-meta">${field('内容类型', state.studioContentId ? `<input class="cp-field" value="${escapeAttr(STUDIO_CONTENT_TYPES[form.type] || form.type)}" readonly>` : `<select class="cp-field" name="type">${typeOptions}</select>`)}${field('发布状态', `<select class="cp-field" name="status"><option value="draft"${form.status === 'draft' ? ' selected' : ''}>草稿</option><option value="published"${form.status === 'published' ? ' selected' : ''}>已发布</option></select>`)}${field('标题', `<input class="cp-field" name="title" value="${escapeAttr(form.title)}" maxlength="160" required>`)}${field('URL 标识', `<input class="cp-field" name="slug" value="${escapeAttr(form.slug)}" maxlength="80" placeholder="留空自动生成">`)}${field('摘要', `<textarea class="cp-field cp-scroll" name="summary" rows="3" maxlength="500">${h(form.summary)}</textarea>`, true)}${field('正文 Markdown', `<textarea class="cp-field cp-scroll" name="contentMd" rows="10" spellcheck="false">${h(form.contentMd)}</textarea>`, true)}${field('封面图片', `<input class="cp-field" name="coverImage" value="${escapeAttr(form.coverImage)}" placeholder="/uploads/... 或 https://...">`, true)}<div class="cp-cover-editor span-2"><div class="cp-cover-preview">${form.coverImage ? `<img src="${escapeAttr(form.coverImage)}" alt="">` : `<span>${icon('image', 22)}内容封面</span>`}</div><div><strong>封面设置</strong><p>上传后会在保存内容时写入封面字段。</p><label class="button secondary cp-upload-button">${icon('upload', 13)}上传封面<input id="studio-content-cover-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif"></label></div></div>${field('扩展数据（JSON）', `<textarea class="cp-field cp-scroll" name="metadataText" rows="6" spellcheck="false">${h(form.metadataText)}</textarea>`, true)}<label class="cp-check-field span-2"><input type="checkbox" name="featured"${form.featured ? ' checked' : ''}><span>设为精选内容</span></label></div></form></div>`;
}

function syncStudioArticleForm(form = app.querySelector('#studio-article-form')) {
  if (!(form instanceof HTMLFormElement) || !state.studioArticleForm) return;
  const data = new FormData(form);
  state.studioArticleForm = {
    ...state.studioArticleForm,
    title: String(data.get('title') || ''),
    slug: String(data.get('slug') || ''),
    category: String(data.get('category') || ''),
    tags: String(data.get('tags') || ''),
    excerpt: String(data.get('excerpt') || ''),
    contentMd: String(data.get('contentMd') || ''),
    coverImage: String(data.get('coverImage') || ''),
    status: state.studioArticleForm.status === 'published' ? 'published' : 'draft',
    publishAt: String(data.get('publishAt') || ''),
    featured: Boolean(form.elements.namedItem('featured')?.checked)
  };
}

function syncStudioContentForm(form = app.querySelector('#studio-content-form')) {
  if (!(form instanceof HTMLFormElement) || !state.studioContentForm) return;
  const data = new FormData(form);
  state.studioContentForm = {
    ...state.studioContentForm,
    type: String(data.get('type') || state.studioContentForm.type || 'dynamic'),
    title: String(data.get('title') || ''),
    slug: String(data.get('slug') || ''),
    summary: String(data.get('summary') || ''),
    contentMd: String(data.get('contentMd') || ''),
    coverImage: String(data.get('coverImage') || ''),
    metadataText: String(data.get('metadataText') || '{}'),
    status: data.get('status') === 'draft' ? 'draft' : 'published',
    publishedAt: String(data.get('publishedAt') || ''),
    featured: Boolean(form.elements.namedItem('featured')?.checked)
  };
}

function scheduleStudioPreview() {
  window.clearTimeout(studioPreviewTimer);
  studioPreviewTimer = window.setTimeout(() => refreshStudioPreview(), 420);
}

async function previewMarkdown(markdown) {
  const { html } = await api('/api/knowledge/preview', { method: 'POST', body: { markdown: String(markdown || '') } });
  return html;
}

async function refreshStudioPreview() {
  if (state.view !== 'studio' || state.studioTab !== 'articles') return;
  const textarea = app.querySelector('#studio-article-form textarea[name="contentMd"]');
  if (textarea) syncStudioArticleForm(textarea.form);
  const markdown = String(textarea?.value ?? state.studioArticleForm?.contentMd ?? '');
  if (!markdown.trim()) {
    state.studioPreview = '<p class="markdown-placeholder">Markdown 预览会显示在这里。</p>';
    updateStudioPreviewDom();
    return;
  }
  const request = ++studioPreviewRequest;
  try {
    const html = await previewMarkdown(markdown);
    if (request !== studioPreviewRequest || state.view !== 'studio' || state.studioTab !== 'articles') return;
    state.studioPreview = html;
    updateStudioPreviewDom();
  } catch (error) {
    if (request === studioPreviewRequest) showError(error);
  }
}

function updateStudioPreviewDom() {
  const preview = app.querySelector('[data-studio-preview]');
  if (preview) preview.innerHTML = state.studioPreview || '<p class="markdown-placeholder">Markdown 预览会显示在这里。</p>';
}

function applyStudioMarkdownFormat(format) {
  const textarea = app.querySelector('#studio-article-form textarea[name="contentMd"]');
  if (!textarea) return;
  const value = textarea.value;
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? start;
  const selected = value.slice(start, end);
  let replacement = selected;
  let selectionStart = start;
  let selectionEnd = end;
  if (format === 'heading' || format === 'list' || format === 'orderedList' || format === 'quote') {
    const prefix = format === 'heading' ? '## ' : format === 'list' ? '- ' : format === 'orderedList' ? '1. ' : '> ';
    replacement = (selected || '在这里输入内容').split('\n').map((line, index) => `${format === 'orderedList' ? `${index + 1}. ` : prefix}${line.replace(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '')}`).join('\n');
    selectionStart = start + prefix.length;
    selectionEnd = start + replacement.length;
  } else if (format === 'bold' || format === 'italic') {
    const marker = format === 'bold' ? '**' : '*';
    replacement = `${marker}${selected || '文字'}${marker}`;
    selectionStart = start + marker.length;
    selectionEnd = selectionStart + (selected || '文字').length;
  } else if (format === 'link') {
    replacement = `[${selected || '链接文字'}](https://)`;
    selectionStart = start + 1;
    selectionEnd = selectionStart + (selected || '链接文字').length;
  } else if (format === 'code') {
    replacement = `\n\`\`\`\n${selected || '在这里输入代码'}\n\`\`\`\n`;
    selectionStart = start + 4;
    selectionEnd = selectionStart + (selected || '在这里输入代码').length;
  }
  textarea.value = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
  textarea.focus();
  textarea.setSelectionRange(selectionStart, selectionEnd);
  state.studioArticleForm.contentMd = textarea.value;
  scheduleStudioPreview();
}

async function uploadStudioImage(file, target) {
  if (!file.type.startsWith('image/')) throw new Error('请选择图片文件');
  if (file.size > 5 * 1024 * 1024) throw new Error('图片不能超过 5 MB');
  const textarea = target === 'studio-body-upload' ? app.querySelector('#studio-article-form textarea[name="contentMd"]') : null;
  const selectionStart = textarea?.selectionStart ?? 0;
  const selectionEnd = textarea?.selectionEnd ?? selectionStart;
  showToast('正在上传图片', 'warning');
  const contentBase64 = await fileToBase64(file);
  const uploaded = await api('/api/uploads', {
    method: 'POST',
    body: {
      filename: file.name,
      contentBase64,
      mimeType: file.type,
      articleId: target === 'studio-body-upload' || target === 'studio-cover-upload' ? state.studioEditingId : null
    }
  });
  state.studioMedia = [{ ...uploaded, created_at: new Date().toISOString() }, ...state.studioMedia];
  if (target === 'studio-content-cover-upload') {
    state.studioContentForm.coverImage = uploaded.url;
    renderStudio();
  } else if (target === 'studio-cover-upload') {
    state.studioArticleForm.coverImage = uploaded.url;
    renderStudio();
    scheduleStudioPreview();
  } else if (textarea) {
    const markdown = `\n\n![图片](${uploaded.url})\n\n`;
    textarea.value = `${textarea.value.slice(0, selectionStart)}${markdown}${textarea.value.slice(selectionEnd)}`;
    textarea.focus();
    textarea.setSelectionRange(selectionStart + markdown.length, selectionStart + markdown.length);
    state.studioArticleForm.contentMd = textarea.value;
    scheduleStudioPreview();
  }
  showToast('图片已上传');
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const input = document.createElement('textarea');
  input.value = value;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

function renderOverview() {
  const data = state.overview;
  const k = data.kpis;
  const openActions = state.actions.filter((item) => !isClosedAction(item.status));
  const critical = openActions.filter((item) => item.priority === 'critical').length;
  const high = openActions.filter((item) => item.priority === 'high').length;
  app.innerHTML = `
    ${viewHead('运营总览', `${data.store.name} 近 30 天经营结果。先看利润和风险，再进入对应模块处理。`, `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}重新计算动作</button>
      <button class="button primary" data-action="new-action">${icon('plus')}新增运营动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('chart', '净销售额', money(k.netSales, data.store.currency), `总销售 ${money(k.sales, data.store.currency)}`, 'listings', 'accent')}
      ${metricCard('target', '净利润率', `${k.margin}%`, `净利润 ${money(k.profit, data.store.currency)}`, 'listings', k.margin < 10 ? 'red' : 'green')}
      ${metricCard('ads', 'ACOS / TACOS', `${k.acos}% / ${k.tacos}%`, `ROAS ${k.roas}x`, 'ads', k.acos > Number(data.store.target_acos) ? 'amber' : 'green')}
      ${metricCard('inventory', '库存风险', `${k.inventoryRiskCount} 个 SKU`, `缺货与滞销合计`, 'inventory', k.inventoryRiskCount ? 'amber' : 'green')}
      ${metricCard('aftersales', '退货率', `${k.returnRate}%`, `${k.units} 件销量`, 'aftersales', k.returnRate > 8 ? 'red' : 'green')}
      ${metricCard('target', '评分健康', `${k.rating} / 5`, `${number(k.reviewCount)} 条评论`, 'aftersales', data.store.health_status === 'warning' ? 'amber' : 'green')}
      ${metricCard('check', '待执行动作', `${openActions.length} 项`, `P0 ${critical} · P1 ${high}`, null, openActions.length ? 'amber' : 'green')}
      ${metricCard('message', '待处理售后', `${k.pendingAfterSales} 项`, `低毛利 SKU ${k.lowMarginProducts} 个`, 'aftersales', k.pendingAfterSales ? 'amber' : 'green')}
    </div>
    <div class="focus-strip cp-focus-strip">
      <div class="focus-copy">
        <span class="focus-label">今日运营焦点</span>
        <strong>${h(openActions[0]?.title || '当前没有需要立即处理的异常')}</strong>
        <small>${h(openActions[0]?.description || '规则引擎会持续复核利润、广告、库存、Listing 与售后数据。')}</small>
      </div>
      <div class="focus-progress">
        <div class="progress-label"><span>动作关闭率</span><strong>${actionCloseRate(state.actions)}%</strong></div>
        <div class="progress-track large"><span style="width:${actionCloseRate(state.actions)}%"></span></div>
      </div>
    </div>
    <div class="cp-dashboard-grid">
      <section class="panel cp-chart-panel">
        <div class="panel-head"><div><span class="panel-kicker">30-day trend</span><h3>销售与利润走势</h3></div><span class="muted">${h(data.store.currency)} · 模拟数据</span></div>
        ${renderTrendChart(data.trend, data.store.currency)}
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">priority queue</span><h3>动作中心</h3></div><button class="text-button" data-action="refresh-actions">刷新 ${icon('arrow')}</button></div>
        <div class="cp-action-list">${openActions.slice(0, 6).map(actionCompact).join('') || emptyBlock('没有待执行动作', '规则引擎当前未发现新异常。')}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">account health</span><h3>账号健康阈值</h3></div><span class="badge status-${h(data.store.health_status)}">${h(STATUS_LABELS[data.store.health_status] || data.store.health_status)}</span></div>
        <div class="cp-health-list">${data.health.map((item) => healthRow(item)).join('')}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">sku watchlist</span><h3>SKU 异常榜</h3></div><button class="text-button" data-nav="listings">全部商品 ${icon('arrow')}</button></div>
        ${renderRiskProducts(data.riskProducts, data.store.currency)}
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">activity</span><h3>最近动态</h3></div><span class="muted">实时回写</span></div>
        <div class="cp-activity-list">${data.activities.slice(0, 6).map((item) => `<div class="cp-activity-row"><span class="activity-dot"></span><div><strong>${h(activityTitle(item.action))}</strong><p>${h(item.detail)}</p></div><time>${h(relativeTime(item.created_at))}</time></div>`).join('')}</div>
      </section>
    </div>`;
}

function renderImports() {
  const batch = state.pendingImport;
  app.innerHTML = `
    ${viewHead('数据导入', '拖入 Amazon、TikTok Shop、Shopee 或 Walmart 报表，自动识别字段并跳过买家隐私信息。', `
      <a class="button secondary" href="/api/knowledge/field-map" target="_blank">${icon('database')}字段映射说明</a>`)}
    <div class="cp-import-grid">
      <section class="panel cp-import-upload">
        <div class="panel-head"><div><span class="panel-kicker">step 1 · upload</span><h3>上传报表</h3></div><span class="safe-chip">上限 10 MB / 20,000 行</span></div>
        <div class="cp-drop-zone" data-drop-zone>
          ${icon('upload', 34)}
          <strong>拖拽 CSV 或 XLSX 到这里</strong>
          <p>支持商品表现、搜索词、库存、退货与评论四类报表</p>
          <label class="button primary">${icon('plus')}选择文件<input id="import-file" type="file" accept=".csv,.xlsx,.xls" hidden></label>
        </div>
        <div class="cp-import-note">${icon('check')}字段自动映射 · ${icon('check')}错误行预览 · ${icon('check')}PII 不入库</div>
      </section>
      <section class="panel cp-import-preview">
        <div class="panel-head"><div><span class="panel-kicker">step 2 · mapping</span><h3>字段映射与预览</h3></div>${batch ? `<span class="badge status-${h(batch.status)}">${h(STATUS_LABELS[batch.status] || batch.status)}</span>` : ''}</div>
        ${batch ? renderImportPreview(batch) : emptyBlock('等待上传报表', '上传后在这里检查字段映射、错误行、PII 跳过项和可入库行数。')}
      </section>
    </div>
    <section class="panel cp-import-history">
      <div class="panel-head"><div><span class="panel-kicker">import history</span><h3>最近导入</h3></div><span class="muted">仅保存脱敏后的字段</span></div>
      ${renderImportHistory(state.imports)}
    </section>`;
}

function renderImportPreview(batch) {
  const fields = IMPORT_TARGET_FIELDS[batch.report_type] || [];
  const sourceKeys = [...new Set([
    ...batch.rows.flatMap((row) => Object.keys(row.raw || {})),
    ...(batch.pii_columns || [])
  ])];
  const mappingRows = sourceKeys.map((source) => {
    const pii = batch.pii_columns.includes(source);
    const selected = batch.mapping[source] || '';
    return `<tr class="${pii ? 'cp-pii-row' : ''}">
      <td><strong>${h(source)}</strong>${pii ? '<span class="badge status-warning">PII 跳过</span>' : ''}</td>
      <td>${customSelect('', Object.fromEntries([['', '不导入'], ...fields]), selected, { disabled: pii, mappingSource: source })}</td>
    </tr>`;
  }).join('');
  const previewRows = batch.rows.slice(0, 8);
  return `
    <div class="cp-import-summary">
      ${miniStat('识别类型', batch.report_type === 'products' ? '商品表现' : batch.report_type === 'ads' ? '搜索词' : batch.report_type === 'inventory' ? '库存' : '退货/评论')}
      ${miniStat('总行数', number(batch.total_rows))}
      ${miniStat('可入库', number(batch.valid_rows), 'green')}
      ${miniStat('错误行', number(batch.error_rows), batch.error_rows ? 'red' : 'green')}
      ${miniStat('PII 跳过', number(batch.pii_columns.length), 'amber')}
    </div>
    ${batch.invalidRequired?.length ? `<div class="cp-inline-alert">${icon('alert')}缺少必填字段，请调整映射后再提交。</div>` : ''}
    <div class="cp-mapping-table"><table class="data-table"><thead><tr><th>源字段</th><th>映射为</th></tr></thead><tbody>${mappingRows}</tbody></table></div>
    <div class="cp-preview-head"><strong>数据预览</strong><span>显示前 ${previewRows.length} 行</span></div>
    <div class="data-table-wrap cp-preview-table"><table class="data-table"><thead><tr><th>行</th>${fields.slice(0, 6).map(([, label]) => `<th>${h(label)}</th>`).join('')}<th>校验</th></tr></thead><tbody>
      ${previewRows.map((row) => `<tr><td>${row.row_index}</td>${fields.slice(0, 6).map(([key]) => `<td>${h(row.normalized[key] ?? '-')}</td>`).join('')}<td>${row.errors.length ? `<span class="badge status-failed">${row.errors.length} 个错误</span>` : '<span class="badge status-healthy">可入库</span>'}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="cp-wizard-actions">
      <button class="button secondary" data-action="reset-import">重新选择</button>
      <button class="button secondary" data-action="cancel-import" data-id="${batch.id}">取消批次</button>
      <button class="button secondary" data-action="apply-mapping" data-id="${batch.id}">${icon('refresh')}应用映射</button>
      <button class="button primary" data-action="commit-import" data-id="${batch.id}" ${batch.valid_rows ? '' : 'disabled'}>${icon('check')}确认入库 ${batch.valid_rows} 行</button>
    </div>`;
}

function renderImportHistory(items) {
  if (!items.length) return emptyBlock('还没有导入记录', '演示数据库内置的数据不会出现在这里。');
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>文件</th><th>类型</th><th>状态</th><th>可入库</th><th>错误</th><th>PII</th><th>时间</th><th></th></tr></thead><tbody>
    ${items.map((item) => `<tr><td><strong>${h(item.filename)}</strong></td><td>${h(reportTypeLabel(item.report_type))}</td><td>${statusBadge(item.status)}</td><td>${number(item.valid_rows)}</td><td>${number(item.error_rows)}</td><td>${number(item.pii_columns.length)}</td><td>${h(shortDateTime(item.created_at))}</td><td>${item.status === 'preview' ? `<button class="text-button" data-action="open-import" data-id="${item.id}">继续处理</button>` : ''}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderListings() {
  const selected = state.products.find((item) => item.id === state.selectedProductId) || state.products[0] || null;
  const filtered = state.products.filter((item) => !state.productQuery || `${item.sku} ${item.title}`.toLowerCase().includes(state.productQuery.toLowerCase()));
  app.innerHTML = `
    ${viewHead('Listing与商品', '用标题、五点、图片、属性、关键词覆盖和合规性六维评分，定位内容短板并生成上新资料包。', `
      <button class="button primary" data-action="listing-package" ${selected ? `data-id="${selected.id}"` : 'disabled'}>${icon('file')}生成资料包</button>`)}
    <div class="cp-split-layout">
      <section class="panel cp-product-sidebar">
        <div class="panel-head"><div><span class="panel-kicker">catalogue</span><h3>商品列表</h3></div><span class="muted">${state.products.length} 个 SKU</span></div>
        <form id="product-search-form" class="cp-search-form"><input name="q" value="${escapeAttr(state.productQuery)}" placeholder="搜索 SKU 或标题"><button class="icon-button" type="submit">${icon('search')}</button></form>
        <div class="cp-product-list">
          ${filtered.map((item) => `<button type="button" class="${item.id === selected?.id ? 'is-active' : ''}" data-action="select-product" data-id="${item.id}"><span>${h(item.sku)}</span><strong>${h(item.title)}</strong><small>Listing ${item.listing_score}/100 · 净利率 ${item.margin_percent}%</small></button>`).join('') || emptyBlock('没有匹配商品', '调整关键词后再试。')}
        </div>
      </section>
      <section class="panel cp-product-detail" id="product-detail" data-product-id="${selected?.id || ''}">
        ${selected ? renderListingDetail(selected) : emptyBlock('暂无商品', '导入商品表现报表后即可评分。')}
      </section>
    </div>
    <section class="panel cp-profit-panel">
      <div class="panel-head"><div><span class="panel-kicker">profit & pricing</span><h3>利润与定价</h3></div><span class="muted">净利润 = 净销售 − 采购 − 佣金 − 履约 − 退款损失 − 广告费</span></div>
      ${renderProfitTable(state.products)}
    </section>`;
}

function renderListingDetail(product) {
  const scores = [
    ['标题', product.titleScore], ['五点描述', product.bulletScore], ['图片', product.imageScore],
    ['属性', product.attributeScore], ['关键词覆盖', product.keywordScore], ['合规性', product.complianceScore]
  ];
  return `
    <header class="cp-detail-head">
      <div><span class="project-kicker">${h(product.sku)} · ${h(product.asin || '待补充 ASIN')}</span><h2>${h(product.title)}</h2><p>${h(product.issue_summary || '当前 Listing 结构完整，继续保持。')}</p></div>
      <div class="cp-score-ring" style="--score:${product.listing_score}"><strong>${product.listing_score}</strong><span>Listing</span></div>
    </header>
    <div class="cp-score-grid">${scores.map(([label, score]) => `<div class="cp-score-item"><div><span>${h(label)}</span><strong>${score}</strong></div><div class="progress-track"><span style="width:${Math.max(0, Math.min(100, Number(score)))}%"></span></div></div>`).join('')}</div>
    <div class="cp-detail-grid">
      <div><span>售价</span><strong>${money(product.price)}</strong></div>
      <div><span>建议售价</span><strong>${money(product.suggested_price)}</strong></div>
      <div><span>盈亏平衡价</span><strong>${money(product.break_even_price)}</strong></div>
      <div><span>转化率</span><strong>${product.cvr_percent}%</strong></div>
      <div><span>退货率</span><strong>${product.return_rate_percent}%</strong></div>
      <div><span>评分</span><strong>${product.rating} / 5</strong></div>
    </div>
    <div class="cp-detail-actions">
      <button class="button primary" data-action="listing-package" data-id="${product.id}">${icon('file')}生成上新资料包</button>
      <button class="button secondary" data-action="create-listing-action" data-id="${product.id}">${icon('plus')}创建优化动作</button>
    </div>`;
}

function renderProfitTable(products) {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>SKU / 商品</th><th>售价</th><th>单位成本</th><th>净销售</th><th>净利润</th><th>净利率</th><th>ACOS</th><th>建议售价</th><th>诊断</th></tr></thead><tbody>
    ${products.map((item) => `<tr><td><strong>${h(item.sku)}</strong><small class="cell-note">${h(item.title)}</small></td><td>${money(item.price)}</td><td>${money(item.unit_cost)}</td><td>${money(item.net_sales_30d)}</td><td class="${item.net_profit_30d < 0 ? 'cp-danger-text' : 'cp-green-text'}">${money(item.net_profit_30d)}</td><td>${item.margin_percent}%</td><td>${item.acos_percent}%</td><td>${money(item.suggested_price)}</td><td>${item.margin_percent < 10 ? '<span class="badge status-warning">低毛利</span>' : '<span class="badge status-healthy">健康</span>'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderAds() {
  const data = state.ads;
  const s = data.summary;
  app.innerHTML = `
    ${viewHead('广告与流量', '按搜索词计算 ACOS、CVR、CPC 和 ROAS，规则直接给出加词、否词、降价、暂停或放量建议。', `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}同步动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('ads', '广告花费', money(s.totalSpend, data.store.currency), '近 30 天', null, 'accent')}
      ${metricCard('chart', '广告销售', money(s.totalSales, data.store.currency), `整体 ACOS ${s.acos}%`, null, s.acos > data.store.target_acos ? 'amber' : 'green')}
      ${metricCard('x', '否词候选', `${s.negativeCandidates} 个`, '15+ 点击且 0 订单', null, 'red')}
      ${metricCard('target', '降价 / 暂停', `${s.reductionCandidates} 个`, `目标 ACOS ${data.store.target_acos}%`, null, 'amber')}
      ${metricCard('plus', '放量候选', `${s.scaleCandidates} 个`, '有订单且 ACOS 达标', null, 'green')}
    </div>
    <section class="panel">
      <div class="panel-head"><div><span class="panel-kicker">search term actions</span><h3>搜索词决策表</h3></div><span class="muted">规则可解释，不使用生成式猜测</span></div>
      ${renderAdsTable(data.items)}
    </section>
    <div class="cp-recommendation-grid">
      ${data.items.filter((item) => item.recommendation !== 'keep').slice(0, 6).map((item) => recommendationCard(item)).join('')}
    </div>`;
}

function renderAdsTable(items) {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>搜索词 / 活动</th><th>SKU</th><th>点击</th><th>花费</th><th>广告销售</th><th>订单</th><th>ACOS</th><th>CVR</th><th>建议</th><th></th></tr></thead><tbody>
    ${items.map((item) => `<tr><td><strong>${h(item.search_term)}</strong><small class="cell-note">${h(item.campaign)} · ${h(item.match_type)}</small></td><td>${h(item.sku)}</td><td>${number(item.clicks)}</td><td>${money(item.spend)}</td><td>${money(item.ad_sales)}</td><td>${number(item.ad_orders)}</td><td>${item.acos_percent}%</td><td>${item.cvr_percent}%</td><td>${recommendationBadge(item)}</td><td><button class="icon-button small" data-action="create-ad-action" data-id="${item.id}" title="创建动作">${icon('plus', 15)}</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderInventory() {
  const data = state.inventory;
  const s = data.summary;
  app.innerHTML = `
    ${viewHead('库存与履约', '以可售天数、采购交期和安全库存计算补货量，同时识别 FBA 在途、订单、退货和异常履约。', `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}刷新库存动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('alert', '缺货风险', `${s.stockout} 个 SKU`, '低于采购交期 + 14 天', null, 'red')}
      ${metricCard('inventory', '滞销风险', `${s.overstock} 个 SKU`, '可售天数高于 90 天', null, 'amber')}
      ${metricCard('check', '库存健康', `${s.healthy} 个 SKU`, '覆盖率处于安全区间', null, 'green')}
      ${metricCard('truck', '建议补货', `${number(s.reorderUnits)} 件`, '按当前日均销量测算', null, 'accent')}
    </div>
    <div class="cp-risk-summary">
      ${data.items.filter((item) => item.risk !== 'healthy').map((item) => `<article class="cp-risk-card ${item.risk}"><span>${h(item.risk_label)}</span><strong>${h(item.sku)}</strong><p>覆盖 ${item.coverage_days} 天 · 可售 ${number(item.available)} 件 · 在途 ${number(item.inbound)} 件</p><small>${h(item.note || item.recommended_order_date)}</small></article>`).join('')}
    </div>
    <section class="panel">
      <div class="panel-head"><div><span class="panel-kicker">inventory coverage</span><h3>补货与库存覆盖</h3></div><span class="muted">可售天数 = (可售 + 在途) ÷ 日均销量</span></div>
      ${renderInventoryTable(data.items)}
    </section>`;
}

function renderInventoryTable(items) {
  return `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>SKU / 商品</th><th>可售</th><th>在途</th><th>预留</th><th>日均销量</th><th>可售天数</th><th>覆盖天数</th><th>建议补货</th><th>风险</th><th>动作</th></tr></thead><tbody>
    ${items.map((item) => `<tr><td><strong>${h(item.sku)}</strong><small class="cell-note">${h(item.product_title)}</small></td><td>${number(item.available)}</td><td>${number(item.inbound)}</td><td>${number(item.reserved)}</td><td>${item.avg_daily_sales}</td><td>${item.available_days} 天</td><td>${item.coverage_days} 天</td><td>${number(item.reorder_units)} 件</td><td><span class="badge status-${item.risk === 'healthy' ? 'healthy' : item.risk === 'stockout' ? 'failed' : 'warning'}">${h(item.risk_label)}</span></td><td><button class="button secondary cp-table-button" data-action="create-inventory-action" data-id="${item.id}">${icon('plus', 14)}建动作</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderAfterSales() {
  const data = state.afterSales;
  const store = data.store;
  const s = data.summary;
  app.innerHTML = `
    ${viewHead('售后与账号', '把差评、退货、买家消息、索赔、订单缺陷、迟发和取消率放在同一条时间线上，并跟踪账号健康阈值。', `
      <button class="button secondary" data-action="refresh-actions">${icon('refresh')}刷新预警动作</button>`)}
    <div class="metric-grid cp-metric-grid">
      ${metricCard('message', '待处理售后', `${s.open} 项`, '含消息、退货和索赔', null, s.open ? 'amber' : 'green')}
      ${metricCard('clock', '超时事项', `${s.overdue} 项`, '超过处理 SLA', null, s.overdue ? 'red' : 'green')}
      ${metricCard('alert', '紧急事项', `${s.critical} 项`, 'P0 需要当天处理', null, s.critical ? 'red' : 'green')}
      ${metricCard('reviews', '退货类问题', `${s.returns} 项`, '关联 SKU 与原因', null, 'accent')}
    </div>
    <section class="panel cp-health-panel">
      <div class="panel-head"><div><span class="panel-kicker">account health</span><h3>店铺健康阈值</h3></div><span class="badge status-${h(store.health_status)}">${h(STATUS_LABELS[store.health_status] || store.health_status)}</span></div>
      <div class="cp-health-grid">${store.health_metrics.map((item) => `<div class="cp-health-card ${item.status}"><div class="cp-health-icon">${icon(item.status === 'healthy' ? 'check' : 'alert')}</div><span>${h(item.label)}</span><strong>${item.key === 'rating' ? item.value : `${item.value}%`}</strong><small>阈值：${item.key === 'rating' ? `≥ ${item.threshold}` : `≤ ${item.threshold}%`}</small></div>`).join('')}</div>
    </section>
    <div class="cp-aftersales-layout">
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">case timeline</span><h3>售后问题时间线</h3></div><span class="muted">${data.items.length} 个事项</span></div>
        <div class="cp-case-timeline">${data.items.map(afterSaleRow).join('')}</div>
      </section>
      <section class="panel">
        <div class="panel-head"><div><span class="panel-kicker">return reasons</span><h3>退货与差评原因</h3></div><span class="muted">按问题类型聚合</span></div>
        ${renderReturnReasons(data.items)}
      </section>
    </div>`;
}

function renderReturnReasons(items) {
  const grouped = new Map();
  for (const item of items) {
    const key = item.reason || item.type;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  }
  const max = Math.max(1, ...grouped.values());
  return `<div class="cp-reason-list">${[...grouped.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => `<div><div><strong>${h(reason)}</strong><span>${count} 项</span></div><div class="progress-track"><span style="width:${(count / max) * 100}%"></span></div></div>`).join('')}</div>`;
}

function renderReviews() {
  const data = state.overview;
  const k = data.kpis;
  app.innerHTML = `
    ${viewHead('运营复盘', '按周期汇总指标、异常、动作结果和未关闭事项，并导出 HTML、Markdown、CSV 或 XLSX 复盘报告。', `
      <button class="button secondary" data-nav="studio">${icon('edit')}维护内容</button>`)}
    <div class="cp-tabs">
      <button class="${state.reviewTab === 'reports' ? 'is-active' : ''}" data-action="set-review-tab" data-tab="reports">${icon('file')}周期报告</button>
      <button class="${state.reviewTab === 'knowledge' ? 'is-active' : ''}" data-action="set-review-tab" data-tab="knowledge">${icon('book')}运营知识库</button>
    </div>
    ${state.reviewTab === 'reports' ? renderReportsTab(data, k) : renderKnowledgeTab()}`;
}

function renderReportsTab(data, k) {
  return `
    <section class="panel cp-report-hero">
      <div>
        <span class="panel-kicker">period review</span>
        <h2>${h(data.store.name)} · 近 30 天运营复盘</h2>
        <p>报告包含 Summary、SKU、Ads、Inventory、After-sales 五个工作表，敏感字段在导出前统一脱敏。</p>
      </div>
      <div class="cp-report-actions">
        <a class="button primary" href="/api/reports/operations/${state.storeId}?format=xlsx">${icon('download')}导出 XLSX</a>
        <a class="button secondary" href="/api/reports/operations/${state.storeId}?format=html">${icon('file')}HTML</a>
        <a class="button secondary" href="/api/reports/operations/${state.storeId}?format=md">${icon('file')}Markdown</a>
        <a class="button secondary" href="/api/reports/operations/${state.storeId}?format=csv">${icon('file')}CSV</a>
      </div>
    </section>
    <div class="metric-grid cp-metric-grid">
      ${metricCard('chart', '净销售额', money(k.netSales, data.store.currency), '近 30 天', null, 'accent')}
      ${metricCard('target', '净利润', money(k.profit, data.store.currency), `净利率 ${k.margin}%`, null, k.margin < 10 ? 'amber' : 'green')}
      ${metricCard('ads', 'ACOS / TACOS', `${k.acos}% / ${k.tacos}%`, `ROAS ${k.roas}x`, null, 'accent')}
      ${metricCard('check', '动作完成', `${data.actionBreakdown.done} 项`, `${data.actionBreakdown.critical + data.actionBreakdown.high} 项高优先级未关闭`, null, data.actionBreakdown.critical ? 'amber' : 'green')}
    </div>
    <div class="cp-review-grid">
      <section class="panel"><div class="panel-head"><div><span class="panel-kicker">what happened</span><h3>本周期摘要</h3></div></div><div class="cp-review-copy"><p><strong>经营表现：</strong>净销售 ${money(k.netSales, data.store.currency)}，净利率 ${k.margin}%，平均评分 ${k.rating}。</p><p><strong>主要风险：</strong>${k.inventoryRiskCount} 个 SKU 存在库存风险，${k.lowMarginProducts} 个 SKU 净利率低于 10%，${k.pendingAfterSales} 个售后事项待处理。</p><p><strong>执行情况：</strong>${data.actionBreakdown.done} 项动作已完成，${data.actionBreakdown.critical} 项 P0 与 ${data.actionBreakdown.high} 项 P1 动作仍需跟进。</p></div></section>
      <section class="panel"><div class="panel-head"><div><span class="panel-kicker">next actions</span><h3>未关闭事项</h3></div></div><div class="cp-action-list">${state.actions.filter((item) => !isClosedAction(item.status)).slice(0, 5).map(actionCompact).join('') || emptyBlock('没有未关闭动作', '本周期执行闭环已完成。')}</div></section>
    </div>`;
}

function renderKnowledgeTab() {
  return `
    <section class="panel cp-knowledge-panel">
      <div class="panel-head"><div><span class="panel-kicker">operations playbook</span><h3>运营知识库</h3></div><form id="knowledge-search-form" class="cp-search-form compact"><input name="q" value="${escapeAttr(state.knowledgeQuery)}" placeholder="搜索 ACOS、库存、Listing"><button class="icon-button" type="submit">${icon('search')}</button></form></div>
      <div class="knowledge-grid">${state.knowledge.map((item) => `<article class="knowledge-card"><span class="project-kicker">${h(item.category)}</span><h3>${h(item.title)}</h3><p>${h(item.symptom)}</p><div class="cp-knowledge-meta"><span>${h(item.tags)}</span><small>${number(item.views)} 次查看</small></div><button class="text-button" data-action="open-knowledge" data-id="${item.id}">查看方法 ${icon('arrow')}</button></article>`).join('')}</div>
    </section>`;
}

function viewHead(title, description, actions = '') {
  return `<section class="panel view-head cp-view-head-card"><div><span class="project-kicker">CrossPilot operations</span><h2>${h(title)}</h2><p>${h(description)}</p></div><div class="head-actions">${actions}</div></section>`;
}

function metricCard(iconName, label, value, note, nav, color = 'accent') {
  const palette = {
    accent: ['#72ddf7', 'rgba(114,221,247,.12)'],
    green: ['#78e6c4', 'rgba(120,230,196,.12)'],
    amber: ['#f5c66d', 'rgba(245,198,109,.12)'],
    red: ['#ff9d8d', 'rgba(255,157,141,.12)']
  }[color] || ['#72ddf7', 'rgba(114,221,247,.12)'];
  return `<article class="metric-card" ${nav ? `data-nav="${nav}" role="button" tabindex="0"` : ''} style="--metric-color:${palette[0]};--metric-soft:${palette[1]}"><span class="metric-icon">${icon(iconName)}</span><div><span>${h(label)}</span><strong>${h(value)}</strong><small>${h(note)}</small></div></article>`;
}

function renderTrendChart(trend, currency) {
  if (!trend.length) return emptyBlock('暂无趋势数据', '导入每日指标后显示趋势。');
  const width = 720;
  const height = 220;
  const padding = 28;
  const sales = trend.map((item) => Number(item.sales || 0));
  const profit = trend.map((item) => Number(item.profit || 0));
  const max = Math.max(...sales, ...profit, 1);
  const min = Math.min(0, ...profit);
  const range = max - min || 1;
  const x = (index) => padding + index * ((width - padding * 2) / Math.max(1, trend.length - 1));
  const y = (value) => height - padding - ((value - min) / range) * (height - padding * 2);
  const salesPoints = trend.map((item, index) => `${x(index)},${y(item.sales)}`).join(' ');
  const profitPoints = trend.map((item, index) => `${x(index)},${y(item.profit)}`).join(' ');
  const area = `${padding},${height - padding} ${salesPoints} ${x(trend.length - 1)},${height - padding}`;
  return `<div class="cp-chart-wrap"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="销售与利润趋势"><defs><linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#72ddf7" stop-opacity=".28"/><stop offset="1" stop-color="#72ddf7" stop-opacity="0"/></linearGradient></defs>${[0, 1, 2, 3].map((index) => `<line x1="${padding}" y1="${padding + index * ((height - padding * 2) / 3)}" x2="${width - padding}" y2="${padding + index * ((height - padding * 2) / 3)}" class="cp-grid-line"/>`).join('')}<polygon points="${area}" fill="url(#sales-fill)"/><polyline points="${salesPoints}" class="cp-line sales"/><polyline points="${profitPoints}" class="cp-line profit"/>${trend.map((item, index) => index % 3 === 0 ? `<text x="${x(index)}" y="${height - 7}" class="cp-axis-label">${h(item.metric_date.slice(5))}</text>` : '').join('')}</svg><div class="cp-chart-legend"><span><i class="sales"></i>销售</span><span><i class="profit"></i>估算利润</span><strong>单位：${h(currency)}</strong></div></div>`;
}

function renderRiskProducts(products, currency) {
  return `<div class="cp-risk-list">${products.map((item) => `<button type="button" data-action="open-product" data-id="${item.id}"><span class="badge ${item.net_profit_30d < 0 ? 'status-failed' : item.margin_percent < 10 ? 'status-warning' : 'status-healthy'}">${item.net_profit_30d < 0 ? '亏损' : `${item.margin_percent}%`}</span><div><strong>${h(item.sku)}</strong><p>${h(item.title)}</p></div><small>${money(item.net_profit_30d, currency)}</small></button>`).join('')}</div>`;
}

function actionCompact(item) {
  return `<article class="cp-action-item" data-action-id="${item.id}"><span class="cp-priority priority-${h(item.priority)}">${h(PRIORITY_LABELS[item.priority] || item.priority)}</span><div><strong>${h(item.title)}</strong><p>${h(item.category)} · ${h(item.owner || '待分配')} · ${h(item.due_date || '未设截止')}</p></div><div class="cp-action-buttons"><button class="icon-button small" data-action="manage-action" data-id="${item.id}" title="查看或更新动作">${icon('edit', 14)}</button><button class="icon-button small" data-action="complete-action" data-id="${item.id}" title="快速完成">${icon('check', 14)}</button></div></article>`;
}

function healthRow(item) {
  return `<div class="cp-health-row"><span class="cp-health-dot ${h(item.status)}"></span><div><strong>${h(item.label)}</strong><small>阈值 ${item.comparator === 'below' ? '≥' : '≤'} ${item.threshold}${item.key === 'rating' ? '' : '%'}</small></div><strong>${item.key === 'rating' ? item.value : `${item.value}%`}</strong><span class="badge status-${h(item.status)}">${item.status === 'healthy' ? '正常' : '预警'}</span></div>`;
}

function recommendationBadge(item) {
  const classes = { negative_exact: 'failed', pause: 'failed', reduce: 'warning', scale: 'healthy', keep: 'healthy' };
  return `<span class="badge status-${classes[item.recommendation] || 'healthy'}">${h(item.action_label)}</span>`;
}

function recommendationCard(item) {
  return `<article class="cp-recommendation-card"><span class="badge status-${item.recommendation === 'scale' ? 'healthy' : item.recommendation === 'negative_exact' || item.recommendation === 'pause' ? 'failed' : 'warning'}">${h(item.action_label)}</span><h3>${h(item.search_term)}</h3><p>${h(item.campaign)} · ${number(item.clicks)} 次点击 · ${money(item.spend)} 花费 · ACOS ${item.acos_percent}%</p><button class="button secondary" data-action="create-ad-action" data-id="${item.id}">${icon('plus')}创建动作</button></article>`;
}

function afterSaleRow(item) {
  const priorityClass = item.priority === 'critical' ? 'failed' : item.priority === 'high' ? 'warning' : 'healthy';
  return `<article class="cp-case-row"><div class="cp-case-marker ${h(item.sla)}">${icon(item.sla === 'overdue' ? 'alert' : 'message', 16)}</div><div><div class="cp-case-head"><span>${h(item.case_no)} · ${h(item.type)}</span><span class="badge status-${priorityClass}">${h(PRIORITY_LABELS[item.priority] || item.priority)}</span></div><strong>${h(item.subject)}</strong><p>${h(item.detail)}</p><small>${h(item.sku || '无 SKU')} · ${h(item.reason || '待补充原因')} · ${h(item.owner || '待分配')}</small></div><div class="cp-case-side"><span class="badge status-${h(item.status)}">${h(STATUS_LABELS[item.status] || item.status)}</span><small class="${item.sla === 'overdue' ? 'cp-danger-text' : ''}">${h(item.sla_label)} · ${h(item.due_date || '无截止')}</small></div></article>`;
}

function miniStat(label, value, color = '') {
  return `<div class="${color ? `is-${color}` : ''}"><span>${h(label)}</span><strong>${h(value)}</strong></div>`;
}

function statusBadge(status) {
  const color = status === 'committed' ? 'healthy' : status === 'cancelled' ? 'archived' : status === 'preview' ? 'warning' : 'pending';
  return `<span class="badge status-${color}">${h(STATUS_LABELS[status] || status)}</span>`;
}

function renderStoreSwitcher() {
  const trigger = document.querySelector('#global-store-toggle');
  const menu = document.querySelector('#global-store-menu');
  if (!trigger || !menu) return;
  const selected = state.stores.find((store) => store.id === state.storeId) || state.stores[0];
  document.documentElement.dataset.activeStore = selected?.id ? String(selected.id) : '';
  const value = trigger.querySelector('.cp-store-picker-value');
  if (value) value.textContent = selected ? `${selected.platform} · ${selected.name}` : '暂无店铺';
  menu.innerHTML = state.stores.map((store) => `<button type="button" role="option" aria-selected="${store.id === state.storeId}" data-store-id="${store.id}"><span><small>${h(store.platform)}</small><strong>${h(store.name)}</strong></span><em>${h(store.market)}</em></button>`).join('');
}

function initStorePicker() {
  const picker = document.querySelector('.cp-store-picker');
  const trigger = document.querySelector('#global-store-toggle');
  const menu = document.querySelector('#global-store-menu');
  if (!picker || !trigger || !menu) return;
  const setOpen = (open) => {
    picker.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!picker.classList.contains('is-open'));
  });
  menu.addEventListener('click', async (event) => {
    const option = event.target.closest('[data-store-id]');
    if (!option) return;
    state.storeId = Number(option.dataset.storeId) || null;
    state.selectedProductId = null;
    state.pendingImport = null;
    renderStoreSwitcher();
    setOpen(false);
    await loadCurrentView(true);
  });
  document.addEventListener('click', (event) => {
    if (!picker.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function renderShellSidebars() {
  const store = state.stores.find((item) => item.id === state.storeId);
  if (!store) return;
  const overview = state.overview;
  const openActions = state.actions.filter((item) => !isClosedAction(item.status));
  const health = store.health_metrics || [];
  const healthWarnings = health.filter((item) => item.status === 'warning').length;
  shellLeft.innerHTML = `
    <section class="aside-section aside-project">
      <div class="aside-section-head"><span>当前店铺</span><small>${h(store.code)}</small></div>
      <h2>${h(store.name)}</h2>
      <p>${h(store.platform)} · ${h(store.market)} · ${h(store.currency)}</p>
      <dl class="aside-facts">
        <div><dt>目标 ACOS</dt><dd>${store.target_acos}%</dd></div>
        <div><dt>目标净利率</dt><dd>${store.target_margin}%</dd></div>
        <div><dt>采购交期</dt><dd>${store.lead_time_days} 天</dd></div>
      </dl>
    </section>
    <section class="aside-section">
      <div class="aside-section-head"><span>账号健康</span><strong>${healthWarnings ? `${healthWarnings} 项预警` : '正常'}</strong></div>
      <div class="aside-progress"><i style="width:${healthWarnings ? 42 : 100}%"></i></div>
      <div class="aside-progress-meta"><span>评分 ${store.health_rating}</span><span>ODR ${store.order_defect_rate}%</span></div>
    </section>`;
  shellRight.innerHTML = `
    <section class="aside-section">
      <div class="aside-section-head"><span>运营状态</span><small>实时</small></div>
      <div class="aside-status-list">
        <div><span><i class="aside-status-dot"></i>规则引擎</span><strong>正常</strong></div>
        <div><span>待执行动作</span><strong>${openActions.length}</strong></div>
        <div><span>库存风险</span><strong>${overview?.kpis?.inventoryRiskCount ?? '-'}</strong></div>
        <div><span>待处理售后</span><strong>${overview?.kpis?.pendingAfterSales ?? '-'}</strong></div>
      </div>
    </section>
    <section class="aside-section">
      <div class="aside-section-head"><span>快捷入口</span></div>
      <div class="aside-links">
        <button data-nav="imports">${icon('imports')}<span>导入报表</span></button>
        <button data-nav="ads">${icon('ads')}<span>广告决策</span></button>
        <button data-nav="inventory">${icon('inventory')}<span>库存补货</span></button>
        <button data-nav="reviews">${icon('reviews')}<span>运营复盘</span></button>
      </div>
    </section>
    <section class="aside-section aside-focus">
      <div class="aside-section-head"><span>下一项动作</span></div>
      <strong>${h(openActions[0]?.title || '等待规则引擎刷新')}</strong>
      <p>${h(openActions[0]?.description || '当前没有未关闭的运营异常。')}</p>
      ${openActions[0] ? `<button class="text-button" data-action="manage-action" data-id="${openActions[0].id}">处理动作 ${icon('arrow')}</button>` : ''}
    </section>`;
}

async function handleClick(event) {
  if (handleCustomSelectClick(event.target)) return;
  const articleLink = event.target.closest('[data-article-slug]');
  if (articleLink && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    state.articleSlug = articleLink.dataset.articleSlug || '';
    await navigate('article');
    return;
  }
  const nav = event.target.closest('[data-nav]');
  const explicitAction = event.target.closest('[data-action]');
  if (nav) {
    const filter = nav.dataset.articleFilter;
    if (filter === 'all') {
      state.articleMode = 'all';
      state.articleCategory = '';
      state.articleTag = '';
      state.articleQuery = '';
      state.articleMonth = '';
      state.articleSeries = '';
    }
    if (['categories', 'tags', 'archive', 'series', 'search'].includes(filter)) {
      state.articleMode = filter;
      state.articleCategory = '';
      state.articleTag = '';
      state.articleMonth = '';
      state.articleSeries = '';
      if (filter === 'search') state.articleQuery = '';
    }
    return navigate(nav.dataset.nav);
  }
  if (!explicitAction) return;
  const { action, id, tab } = explicitAction.dataset;
  try {
    if (action === 'close-modal' && (event.target === explicitAction || !explicitAction.classList.contains('modal-backdrop'))) closeModal();
    if (action === 'set-review-tab') {
      state.reviewTab = tab;
      renderReviews();
    }
    if (action === 'select-product') {
      state.selectedProductId = Number(id);
      renderListings();
    }
    if (action === 'open-product') {
      state.selectedProductId = Number(id);
      await navigate('listings');
    }
    if (action === 'listing-package') {
      const view = state.view;
      const request = state.viewRequest;
      const data = await api(`/api/products/${id}/listing-package`);
      if (!isCurrentViewRequest(request, view) || view !== 'listings') return;
      openModal({ title: `${data.product.sku} · 上新资料包`, wide: true, content: renderListingPackage(data) });
    }
    if (action === 'create-listing-action') {
      const product = state.products.find((item) => item.id === Number(id));
      await api('/api/actions', { method: 'POST', body: { storeId: state.storeId, productId: id, category: 'Listing', title: `优化 ${product?.sku || ''} 的 Listing 内容`, description: `当前 Listing 得分 ${product?.listing_score || 0}/100，优先补齐薄弱维度。`, priority: 'medium', recommendation: 'manual_listing' } });
      showToast('Listing 优化动作已创建');
      await loadListings();
    }
    if (action === 'create-ad-action') {
      const item = state.ads.items.find((row) => row.id === Number(id));
      await api('/api/actions', { method: 'POST', body: { storeId: state.storeId, productId: item.product_id, category: '广告', title: `${item.action_label}：${item.search_term}`, description: `${item.campaign} · ACOS ${item.acos_percent}% · ${item.clicks} 次点击`, priority: item.recommendation === 'negative_exact' || item.recommendation === 'pause' ? 'high' : 'medium', recommendation: item.recommendation } });
      showToast('广告动作已进入执行队列');
      await loadAds();
    }
    if (action === 'create-inventory-action') {
      const item = state.inventory.items.find((row) => row.id === Number(id));
      await api('/api/actions', { method: 'POST', body: { storeId: state.storeId, productId: item.product_id, category: '库存', title: `${item.risk_label}：${item.sku}`, description: `覆盖 ${item.coverage_days} 天，建议补货 ${item.reorder_units} 件。`, priority: item.risk === 'stockout' ? 'high' : 'medium', recommendation: item.risk } });
      showToast('库存动作已创建');
      await loadInventory();
    }
    if (action === 'refresh-actions') await refreshActions();
    if (action === 'new-action') openActionModal();
    if (action === 'manage-action' || action === 'open-action') {
      const view = state.view;
      const request = state.viewRequest;
      const item = await api(`/api/actions/${id}`);
      if (!isCurrentViewRequest(request, view)) return;
      openActionModal(item);
    }
    if (action === 'complete-action') {
      await api(`/api/actions/${id}`, { method: 'PATCH', body: { status: 'done', result: '执行完成，证据待补充。', evidence: '演示页快速完成' } });
      showToast('动作已完成并回写复盘数据');
      await loadCurrentView(true);
    }
    if (action === 'apply-mapping') await applyImportMapping(Number(id));
    if (action === 'commit-import') {
      await api(`/api/imports/${id}/commit`, { method: 'POST', body: {} });
      state.pendingImport = null;
      showToast('报表已确认入库，运营动作已重新计算');
      await loadImports();
    }
    if (action === 'cancel-import') {
      await api(`/api/imports/${id}/cancel`, { method: 'POST', body: {} });
      state.pendingImport = null;
      showToast('导入批次已取消', 'warning');
      await loadImports();
    }
    if (action === 'reset-import') {
      state.pendingImport = null;
      renderImports();
    }
    if (action === 'open-import') {
      const view = state.view;
      const request = state.viewRequest;
      const pendingImport = await api(`/api/imports/${id}`);
      if (!isCurrentViewRequest(request, view) || view !== 'imports') return;
      state.pendingImport = pendingImport;
      renderImports();
    }
    if (action === 'open-knowledge') {
      await openKnowledgeArticle(id);
    }
    if (action === 'studio-tab') {
      state.studioTab = ['articles', 'comments', 'media', 'structured'].includes(tab) ? tab : 'articles';
      if (state.studioTab === 'articles' && !state.studioArticleForm) resetStudioArticle(false);
      if (state.studioTab === 'structured' && !state.studioContentForm) resetStudioContent('dynamic', false);
      renderStudio();
      if (state.studioTab === 'articles') scheduleStudioPreview();
    }
    if (action === 'studio-new-article') {
      resetStudioArticle(false);
      if (state.view === 'studio') renderStudio();
      else await navigate('studio');
      scheduleStudioPreview();
    }
    if (action === 'studio-select-article') {
      const article = state.articles.find((item) => item.id === Number(id));
      if (article) {
        selectStudioArticle(article);
        scheduleStudioPreview();
      }
    }
    if (action === 'studio-delete-article') {
      const article = state.articles.find((item) => item.id === Number(id));
      if (!window.confirm(`确定删除“${article?.title || '这篇文章'}”吗？`)) return;
      await api(`/api/knowledge/${id}`, { method: 'DELETE' });
      resetStudioArticle(false);
      showToast('文章已删除');
      await loadStudio();
    }
    if (action === 'studio-clear-cover') {
      syncStudioArticleForm();
      state.studioArticleForm.coverImage = '';
      renderStudio();
    }
    if (action === 'studio-preview') await refreshStudioPreview();
    if (action === 'studio-format') {
      syncStudioArticleForm();
      applyStudioMarkdownFormat(explicitAction.dataset.format || '');
    }
    if (action === 'studio-open-preview') {
      state.articleSlug = explicitAction.dataset.slug || '';
      await navigate('article');
    }
    if (action === 'studio-comment') {
      await api(`/api/comments/${id}`, { method: 'PATCH', body: { status: explicitAction.dataset.status || 'pending' } });
      showToast('评论状态已更新');
      await loadStudio();
    }
    if (action === 'studio-delete-comment') {
      if (!window.confirm('确定删除这条评论吗？')) return;
      await api(`/api/comments/${id}`, { method: 'DELETE' });
      showToast('评论已删除');
      await loadStudio();
    }
    if (action === 'studio-copy-media') {
      await copyText(explicitAction.dataset.url || '');
      showToast('图片地址已复制');
    }
    if (action === 'studio-new-content') {
      resetStudioContent('dynamic', false);
      renderStudio();
    }
    if (action === 'studio-select-content') {
      const item = state.studioContent.find((entry) => entry.id === Number(id));
      if (item) selectStudioContent(item);
    }
    if (action === 'studio-delete-content') {
      const item = state.studioContent.find((entry) => entry.id === Number(id));
      if (!item || !window.confirm(`确定删除“${item.title}”吗？`)) return;
      await api(`/api/content/${encodeURIComponent(item.type)}/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      resetStudioContent('dynamic', false);
      showToast('内容模块已删除');
      await loadStudio();
    }
    if (action === 'open-article' || action === 'preview-article') {
      state.articleSlug = explicitAction.dataset.slug || '';
      await navigate('article');
    }
    if (action === 'back-articles') await navigate('articles');
    if (action === 'new-article') {
      resetStudioArticle(false);
      if (state.view === 'studio') renderStudio();
      else await navigate('studio');
      scheduleStudioPreview();
    }
    if (action === 'edit-article') {
      state.studioEditingId = Number(id) || null;
      state.studioArticleForm = null;
      state.studioTab = 'articles';
      await navigate('studio');
    }
    if (action === 'delete-article') {
      const article = state.articles.find((item) => item.id === Number(id));
      if (!window.confirm(`确定删除“${article?.title || '这篇文章'}”吗？`)) return;
      await api(`/api/knowledge/${id}`, { method: 'DELETE' });
      showToast('文章已删除');
      await loadCurrentView(true);
    }
    if (action === 'article-mode') {
      state.articleMode = explicitAction.dataset.mode || 'all';
      state.articleCategory = '';
      state.articleTag = '';
      state.articleMonth = '';
      state.articleSeries = '';
      await navigate('articles');
    }
    if (action === 'filter-category') {
      state.articleCategory = explicitAction.dataset.value || '';
      state.articleTag = '';
      await navigate('articles');
    }
    if (action === 'filter-tag') {
      state.articleTag = explicitAction.dataset.tag || explicitAction.dataset.value || '';
      state.articleCategory = '';
      state.articleMode = 'tags';
      await navigate('articles');
    }
    if (action === 'filter-series') {
      const value = explicitAction.dataset.value || '';
      state.articleSeries = state.articleSeries === value ? '' : value;
      await navigate('articles');
    }
    if (action === 'toggle-month') {
      const value = explicitAction.dataset.value || '';
      state.articleMonth = state.articleMonth === value ? '' : value;
      await navigate('articles');
    }
    if (action === 'article-view') {
      state.articleView = explicitAction.dataset.view === 'grid' ? 'grid' : 'list';
      renderArticles();
    }
    if (action === 'clear-article-filter') {
      state.articleCategory = '';
      state.articleTag = '';
      state.articleMonth = '';
      state.articleSeries = '';
      await navigate('articles');
    }
    if (action === 'refresh') await loadCurrentView(true);
  } catch (error) {
    showError(error);
  }
}

function handleGlobalKeydown(event) {
  const trigger = event.target.closest?.('[data-cp-select-trigger]');
  const option = event.target.closest?.('[data-cp-select-option]');
  if (event.key === 'Escape') {
    const openSelect = event.target.closest?.('[data-cp-select].is-open');
    if (openSelect) {
      closeCustomSelect(openSelect);
      openSelect.querySelector('[data-cp-select-trigger]')?.focus();
      return;
    }
    closeModal();
    return;
  }
  if (trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
    const select = trigger.closest('[data-cp-select]');
    closeCustomSelects(select);
    select.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    const menu = select.querySelector('[data-cp-select-menu]');
    menu.hidden = false;
    const options = [...menu.querySelectorAll('[data-cp-select-option]')];
    const target = event.key === 'ArrowUp' ? options.at(-1) : options.find((item) => item.getAttribute('aria-selected') === 'true') || options[0];
    target?.focus();
    return;
  }
  if (option && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const options = [...option.closest('[data-cp-select-menu]').querySelectorAll('[data-cp-select-option]')];
    const index = options.indexOf(option);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : event.key === 'ArrowDown'
          ? (index + 1) % options.length
          : (index - 1 + options.length) % options.length;
    options[nextIndex]?.focus();
  }
}

function handleInput(event) {
  const form = event.target.closest?.('form');
  if (!form) return;
  if (form.id === 'studio-article-form') {
    syncStudioArticleForm(form);
    if (event.target.name === 'contentMd') scheduleStudioPreview();
  }
  if (form.id === 'studio-content-form') syncStudioContentForm(form);
}

async function handleSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    if (form.id === 'studio-article-form') {
      const editingId = state.studioEditingId;
      const intent = String(event.submitter?.value || data.intent || 'save');
      const currentStatus = state.studioArticleForm?.displayStatus || 'draft';
      const rejectionNote = intent === 'reject'
        ? String(window.prompt('请填写驳回原因', state.studioArticleForm?.reviewNote || '') || '').trim()
        : '';
      if (intent === 'reject' && !rejectionNote) return;
      const reviewAction = intent === 'submit-review' || intent === 'approve' || intent === 'reject';
      const publishNow = !reviewAction && intent !== 'unpublish' && ['published', 'pending'].includes(currentStatus);
      const publishAt = String(data.publishAt || '').trim();
      const payload = {
        title: String(data.title || '').trim(),
        slug: String(data.slug || '').trim(),
        category: String(data.category || '').trim(),
        tags: String(data.tags || '').trim(),
        excerpt: String(data.excerpt || '').trim(),
        contentMd: String(data.contentMd || ''),
        coverImage: String(data.coverImage || '').trim(),
        status: publishNow ? 'published' : 'draft',
        reviewStatus: reviewAction ? 'submitted' : publishNow ? undefined : 'draft',
        featured: Boolean(form.elements.namedItem('featured')?.checked),
        publishAt: publishAt ? new Date(publishAt).toISOString() : ''
      };
      let saved = await api(editingId ? `/api/knowledge/${editingId}` : '/api/knowledge', {
        method: editingId ? 'PATCH' : 'POST',
        body: payload
      });
      if (intent === 'approve' || intent === 'reject') {
        saved = await api(`/api/knowledge/${saved.id}/review`, {
          method: 'POST',
          body: { decision: intent === 'approve' ? 'approved' : 'rejected', note: rejectionNote }
        });
      }
      state.studioEditingId = saved.id;
      state.studioArticleForm = articleToStudioForm(saved);
      state.studioPreview = saved.html || await previewMarkdown(saved.content_md);
      showToast(intent === 'submit-review' ? '文章已送审' : intent === 'approve' ? '审核通过并发布' : intent === 'reject' ? '文章已驳回' : intent === 'unpublish' ? '文章已转为草稿' : editingId ? '文章已保存' : '文章已创建');
      await loadStudio();
      selectStudioArticle(state.articles.find((item) => item.id === saved.id) || saved, false);
      renderStudio();
    }
    if (form.id === 'studio-content-form') {
      const metadataText = String(data.metadataText || '').trim() || '{}';
      let metadata;
      try {
        metadata = JSON.parse(metadataText);
      } catch {
        throw new Error('扩展数据不是有效的 JSON');
      }
      if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error('扩展数据必须是 JSON 对象');
      const type = state.studioContentId ? state.studioContentForm?.type : String(data.type || 'dynamic');
      const publishAt = String(data.publishedAt || '').trim();
      const saved = await api(state.studioContentId ? `/api/content/${encodeURIComponent(type)}/${encodeURIComponent(state.studioContentId)}` : '/api/content', {
        method: state.studioContentId ? 'PATCH' : 'POST',
        body: {
          type,
          title: String(data.title || '').trim(),
          slug: String(data.slug || '').trim(),
          summary: String(data.summary || '').trim(),
          contentMd: String(data.contentMd || ''),
          coverImage: String(data.coverImage || '').trim(),
          metadata,
          status: data.status === 'draft' ? 'draft' : 'published',
          featured: Boolean(form.elements.namedItem('featured')?.checked),
          publishedAt: publishAt ? new Date(publishAt).toISOString() : ''
        }
      });
      state.studioContentId = saved.id;
      state.studioContentForm = contentToStudioForm(saved);
      showToast('内容模块已保存');
      await loadStudio();
      selectStudioContent(state.studioContent.find((item) => item.id === saved.id) || saved, false);
      renderStudio();
    }
    if (form.id === 'action-form') {
      await api(data.id ? `/api/actions/${data.id}` : '/api/actions', {
        method: data.id ? 'PATCH' : 'POST',
        body: { ...data, storeId: state.storeId, productId: data.productId || null }
      });
      closeModal();
      showToast(data.id ? '动作已更新并记录时间线' : '运营动作已创建');
      await loadCurrentView(true);
    }
    if (form.id === 'article-search-form') {
      state.articleQuery = String(data.q || '').trim();
      await loadArticles();
    }
    if (form.id === 'home-search-form') {
      state.homeQuery = String(data.q || '').trim();
      renderHome();
    }
    if (form.id === 'product-search-form') {
      state.productQuery = String(data.q || '').trim();
      renderListings();
    }
    if (form.id === 'knowledge-search-form') {
      state.knowledgeQuery = String(data.q || '').trim();
      await loadReviews();
    }
  } catch (error) {
    showError(error);
  }
}

async function handleChange(event) {
  const form = event.target.closest?.('form');
  if (form?.id === 'studio-article-form') syncStudioArticleForm(form);
  if (form?.id === 'studio-content-form') syncStudioContentForm(form);
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (['studio-cover-upload', 'studio-body-upload', 'studio-content-cover-upload'].includes(event.target.id)) {
      await uploadStudioImage(file, event.target.id);
      return;
    }
    if (event.target.id === 'import-file') await previewImport(file);
  } catch (error) {
    showError(error);
  } finally {
    event.target.value = '';
  }
}

function handleDragOver(event) {
  if (!event.target.closest('[data-drop-zone]')) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

async function handleDrop(event) {
  const zone = event.target.closest('[data-drop-zone]');
  if (!zone) return;
  event.preventDefault();
  const file = event.dataTransfer.files?.[0];
  if (!file) return;
  try {
    await previewImport(file);
  } catch (error) {
    showError(error);
  }
}

async function previewImport(file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('文件不能超过 10 MB');
  const view = state.view;
  const request = state.viewRequest;
  app.querySelector('.cp-import-preview')?.classList.add('is-loading');
  showToast('正在识别报表和字段映射', 'warning');
  const contentBase64 = await fileToBase64(file);
  const pendingImport = await api('/api/imports/preview', {
    method: 'POST',
    body: { storeId: state.storeId, filename: file.name, contentBase64, reportType: 'auto' }
  });
  if (!isCurrentViewRequest(request, view) || view !== 'imports') return;
  state.pendingImport = pendingImport;
  showToast(`识别为${reportTypeLabel(state.pendingImport.report_type)}，已跳过 ${state.pendingImport.pii_columns.length} 个 PII 字段`);
  renderImports();
}

async function applyImportMapping(batchId) {
  const view = state.view;
  const request = state.viewRequest;
  const mapping = {};
  document.querySelectorAll('[data-mapping-source]').forEach((select) => {
    if (select.value) mapping[select.dataset.mappingSource] = select.value;
  });
  const pendingImport = await api(`/api/imports/${batchId}/mapping`, { method: 'PATCH', body: { mapping } });
  if (!isCurrentViewRequest(request, view) || view !== 'imports') return;
  state.pendingImport = pendingImport;
  showToast('字段映射已重新校验');
  renderImports();
}

async function refreshActions() {
  const result = await api('/api/actions/refresh', { method: 'POST', body: { storeId: state.storeId } });
  state.actions = result.items;
  showToast(`规则引擎已刷新，共 ${result.items.filter((item) => !isClosedAction(item.status)).length} 项待执行`);
  if (state.view === 'overview' || state.view === 'reviews') await loadCurrentView();
  else renderShellSidebars();
}

function openActionModal(item = null) {
  openModal({
    title: item ? item.title : '新增运营动作',
    wide: true,
    content: `<form id="action-form" class="form-grid">
      <input type="hidden" name="id" value="${item?.id || ''}">
      ${field('动作标题 *', `<input name="title" required value="${escapeAttr(item?.title || '')}" ${item ? 'readonly' : ''} placeholder="例如：暂停无效搜索词">`)}
      ${field('模块', customSelect('category', { 广告: '广告', 库存: '库存', Listing: 'Listing', 利润: '利润', 售后: '售后', 运营: '运营' }, item?.category || '运营'))}
      ${field('优先级', customSelect('priority', { critical: 'P0 紧急', high: 'P1 高', medium: 'P2 中', low: 'P3 低' }, item?.priority || 'medium'))}
      ${field('状态', customSelect('status', { open: '待处理', in_progress: '处理中', deferred: '已延期', done: '已完成', closed: '已关闭', ignored: '已忽略' }, item?.status || 'open'))}
      ${field('负责人', `<input name="owner" value="${escapeAttr(item?.owner || '')}" placeholder="例如：运营-林">`)}
      ${field('截止日期', `<input type="date" name="dueDate" value="${escapeAttr(item?.due_date || today())}">`)}
      ${field('执行结果', `<textarea name="result" rows="3" placeholder="记录处理结果和指标变化">${h(item?.result || '')}</textarea>`, true)}
      ${field('执行证据', `<textarea name="evidence" rows="3" placeholder="例如：否词截图、补货单号、Listing 修改前后截图">${h(item?.evidence || '')}</textarea>`, true)}
      <p class="form-note span-2">保存后会自动写入动作时间线，并回写到运营复盘和报告摘要。</p>
      <div class="form-actions span-2"><button class="button secondary" type="button" data-action="close-modal">取消</button><button class="button primary" type="submit">${item ? '保存执行结果' : '创建动作'}</button></div>
    </form>`
  });
}

function customSelect(name, items, selected, { disabled = false, mappingSource = '' } = {}) {
  const entries = Object.entries(items);
  const currentValue = String(selected ?? '');
  const current = entries.find(([value]) => String(value) === currentValue) || entries[0] || ['', '请选择'];
  const hiddenName = name ? ` name="${escapeAttr(name)}"` : '';
  const mapping = mappingSource ? ` data-mapping-source="${escapeAttr(mappingSource)}"` : '';
  return `<div class="cp-select${disabled ? ' is-disabled' : ''}" data-cp-select>
    <input type="hidden"${hiddenName}${mapping} value="${escapeAttr(current[0])}" data-cp-select-input>
    <button class="cp-select-trigger" type="button" data-cp-select-trigger aria-haspopup="listbox" aria-expanded="false"${disabled ? ' disabled' : ''}>
      <span data-cp-select-label>${h(current[1])}</span>
      <span class="cp-select-caret">${icon('chevronDown', 14)}</span>
    </button>
    <div class="cp-select-menu" role="listbox" data-cp-select-menu hidden>
      ${entries.map(([value, label]) => `<button type="button" role="option" data-cp-select-option data-cp-select-value="${escapeAttr(value)}" aria-selected="${String(value) === currentValue}">${h(label)}</button>`).join('')}
    </div>
  </div>`;
}

function setCustomSelectValue(select, value, label) {
  const input = select.querySelector('[data-cp-select-input]');
  const output = select.querySelector('[data-cp-select-label]');
  const trigger = select.querySelector('[data-cp-select-trigger]');
  if (input) input.value = value;
  if (output) output.textContent = label;
  select.querySelectorAll('[data-cp-select-option]').forEach((option) => {
    option.setAttribute('aria-selected', String(option.dataset.cpSelectValue === value));
  });
  closeCustomSelect(select);
  trigger?.focus();
}

function closeCustomSelect(select) {
  select.classList.remove('is-open');
  select.querySelector('[data-cp-select-trigger]')?.setAttribute('aria-expanded', 'false');
  const menu = select.querySelector('[data-cp-select-menu]');
  if (menu) menu.hidden = true;
}

function closeCustomSelects(except = null) {
  document.querySelectorAll('[data-cp-select].is-open').forEach((select) => {
    if (select !== except) closeCustomSelect(select);
  });
}

function handleCustomSelectClick(target) {
  const option = target.closest('[data-cp-select-option]');
  if (option) {
    const select = option.closest('[data-cp-select]');
    if (select) setCustomSelectValue(select, option.dataset.cpSelectValue || '', option.textContent || '');
    return true;
  }
  const trigger = target.closest('[data-cp-select-trigger]');
  if (trigger) {
    const select = trigger.closest('[data-cp-select]');
    if (!select) return true;
    const opening = !select.classList.contains('is-open');
    closeCustomSelects(select);
    select.classList.toggle('is-open', opening);
    trigger.setAttribute('aria-expanded', String(opening));
    const menu = select.querySelector('[data-cp-select-menu]');
    if (menu) {
      menu.hidden = !opening;
      if (opening) menu.querySelector('[aria-selected="true"]')?.focus();
    }
    return true;
  }
  if (!target.closest('[data-cp-select]')) closeCustomSelects();
  return false;
}

function renderListingPackage(data) {
  return `<div class="cp-package">
    <div class="cp-package-head"><div><span>${h(data.product.sku)} · ${data.score}/100</span><h3>${h(data.product.title)}</h3></div><span class="safe-chip">模拟数据</span></div>
    <section><h4>建议标题</h4><p class="cp-code-block">${h(data.titleSuggestion)}</p></section>
    <section><h4>五点文案骨架</h4><ol>${data.bullets.map((item) => `<li>${h(item)}</li>`).join('')}</ol></section>
    <section><h4>图片需求清单</h4><ul>${data.imageRequirements.map((item) => `<li>${h(item)}</li>`).join('')}</ul></section>
    <section><h4>关键词分组</h4><div class="cp-keyword-grid">${data.keywordClusters.map((group) => `<div><strong>${h(group.cluster)}</strong><p>${group.terms.map(h).join(' · ')}</p></div>`).join('')}</div></section>
    <section><h4>优先改进</h4><ul>${data.priorityActions.map((item) => `<li>${h(item)}</li>`).join('')}</ul></section>
  </div>`;
}

function openModal({ title, content, wide = false, className = '' }) {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal">
    <section class="modal-card ${wide ? 'is-wide' : ''} ${escapeAttr(className)}" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}" data-modal-content>
      <header><div><span>CrossPilot</span><h2>${h(title)}</h2></div><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('x')}</button></header>
      <div class="modal-body">${content}</div>
    </section>
  </div>`;
}

function closeModal() {
  modalRoot.innerHTML = '';
}

async function navigate(view) {
  if (!VIEW_META[view]) return false;
  if (CONTENT_ROUTES[view]) {
    leaveForPage(CONTENT_ROUTES[view]);
    return true;
  }
  if (view === 'article' && !state.articleSlug) return false;
  const changed = state.view !== view;
  if (changed) window.crosspilotPageTransition?.start();
  state.view = view;
  window.history.pushState({}, '', routeForView(view));
  updateViewChrome();
  const loaded = await loadCurrentView();
  if (changed) window.crosspilotPageTransition?.finish();
  if (changed && loaded && state.view === view) requestAnimationFrame(scrollToContentStart);
  return loaded;
}

function routeForView(view) {
  if (view === 'home') return '/';
  if (view === 'article') return `/articles/${encodeURIComponent(state.articleSlug)}`;
  if (view !== 'articles') return `/${view}`;
  const params = new URLSearchParams();
  if (state.articleQuery) params.set('q', state.articleQuery);
  if (state.articleCategory) params.set('category', state.articleCategory);
  if (state.articleTag) params.set('tag', state.articleTag);
  if (state.articleSeries) params.set('series', state.articleSeries);
  if (state.articleMonth) params.set('month', state.articleMonth);
  return `${ARTICLE_MODE_ROUTES[state.articleMode] || '/articles'}${params.size ? `?${params}` : ''}`;
}

async function handleSearchNavigation(detail) {
  const productId = Number(detail.productId) || null;
  const actionId = Number(detail.actionId) || null;
  const knowledgeId = Number(detail.knowledgeId) || null;

  if (productId) {
    state.selectedProductId = productId;
    state.productQuery = '';
    if (await navigate('listings')) highlightSearchTarget('[data-product-id="' + productId + '"]');
    return;
  }

  if (actionId) {
    const request = state.viewRequest;
    const item = await api(`/api/actions/${actionId}`);
    if (request !== state.viewRequest) return;
    const targetView = actionViewForCategory(item.category);
    if (VIEW_META[targetView] && await navigate(targetView)) openActionModal(item);
    return;
  }

  if (knowledgeId) {
    state.reviewTab = 'knowledge';
    if (await navigate('reviews')) await openKnowledgeArticle(knowledgeId);
    return;
  }

  if (VIEW_META[detail.view]) await navigate(detail.view);
}

function actionViewForCategory(category) {
  return { '广告': 'ads', '库存': 'inventory', 'Listing': 'listings', '售后': 'aftersales', '数据': 'imports' }[category] || 'overview';
}

function highlightSearchTarget(selector) {
  window.requestAnimationFrame(() => {
    const target = document.querySelector(selector);
    if (!target) return;
    target.classList.remove('cp-search-target');
    void target.offsetWidth;
    target.classList.add('cp-search-target');
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => target.classList.remove('cp-search-target'), 2600);
  });
}

async function openKnowledgeArticle(id) {
  const article = await api(`/api/knowledge/${id}`);
  if (article?.slug) {
    state.articleSlug = article.slug;
    await navigate('article');
  }
}

function initPageTransitions() {
  const bar = document.querySelector('#page-transition-progress i');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animation = null;

  function start() {
    document.documentElement.classList.add('is-page-transitioning');
    if (!bar) return;
    animation?.cancel();
    animation = bar.animate(
      [
        { transform: 'scaleX(0.04)', opacity: 1 },
        { transform: 'scaleX(0.72)', opacity: 1 },
        { transform: 'scaleX(0.9)', opacity: 1 }
      ],
      { duration: reduceMotion ? 1 : 5000, easing: 'cubic-bezier(0.12, 0.72, 0.18, 1)', fill: 'forwards' }
    );
  }

  function finish() {
    animation?.cancel();
    animation = null;
    if (bar) {
      bar.animate(
        [
          { transform: 'scaleX(0.96)', opacity: 1 },
          { transform: 'scaleX(1)', opacity: 1 },
          { transform: 'scaleX(1)', opacity: 0 }
        ],
        { duration: reduceMotion ? 1 : 420, easing: 'ease-out', fill: 'forwards' }
      ).finished.finally(() => {
        bar.style.transform = 'scaleX(0)';
        bar.style.opacity = '0';
      });
    }
    window.requestAnimationFrame(() => document.documentElement.classList.remove('is-page-transitioning'));
  }

  window.crosspilotPageTransition = { start, finish };
  window.addEventListener('pageshow', finish);
  window.requestAnimationFrame(() => {
    document.documentElement.classList.add('cp-header-ready');
    start();
    window.setTimeout(finish, reduceMotion ? 0 : 260);
  });
}

function leaveForPage(url) {
  window.crosspilotPageTransition?.start();
  window.setTimeout(() => window.location.assign(url), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 90);
}

function updateViewChrome() {
  const meta = VIEW_META[state.view];
  pageTitle.textContent = meta.title;
  pageEyebrow.textContent = meta.eyebrow;
  document.querySelectorAll('[data-nav]').forEach((button) => {
    const navView = state.view === 'article' ? 'articles' : state.view;
    const active = button.dataset.nav === navView;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('.nav-tools-trigger').forEach((trigger) => {
    const articleMenu = trigger.getAttribute('aria-controls') === 'articles-menu';
    const contentViews = ['articles', 'article', 'studio'];
    trigger.classList.toggle('is-active', articleMenu ? contentViews.includes(state.view) : !['home', 'overview', ...contentViews].includes(state.view));
  });
}

function initHeroTypewriter() {
  if (!heroTypewriter) return;
  heroTypewriterEnabled = readHeroTypewriterEnabled();
  if (heroTypewriterEnabled) startHeroTypewriter();
  else stopHeroTypewriter();
  window.addEventListener('crosspilot:typewriter-change', (event) => {
    setHeroTypewriterEnabled(event.detail?.enabled);
  });
}

function readHeroTypewriterEnabled() {
  try {
    return localStorage.getItem('crosspilot-typewriter') !== 'false';
  } catch {
    return true;
  }
}

function stopHeroTypewriter() {
  window.clearTimeout(heroTypewriterTimer);
  heroTypewriterTimer = 0;
  if (heroTypewriter) heroTypewriter.textContent = HERO_PHRASES[0];
}

function startHeroTypewriter() {
  if (!heroTypewriter) return;
  stopHeroTypewriter();
  heroTypewriter.textContent = '';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTypewriter.textContent = HERO_PHRASES[0];
    return;
  }
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  const schedule = (delay) => {
    heroTypewriterTimer = window.setTimeout(step, delay);
  };
  const step = () => {
    if (!heroTypewriterEnabled) return;
    const phrase = HERO_PHRASES[phraseIndex];
    if (!deleting) {
      characterIndex += 1;
      heroTypewriter.textContent = phrase.slice(0, characterIndex);
      if (characterIndex === phrase.length) {
        deleting = true;
        schedule(1800);
      } else schedule(72);
      return;
    }
    characterIndex -= 1;
    heroTypewriter.textContent = phrase.slice(0, characterIndex);
    if (characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % HERO_PHRASES.length;
      schedule(420);
    } else schedule(28);
  };
  schedule(500);
}

function setHeroTypewriterEnabled(enabled) {
  const nextEnabled = Boolean(enabled);
  if (heroTypewriterEnabled === nextEnabled) return;
  heroTypewriterEnabled = nextEnabled;
  if (nextEnabled) startHeroTypewriter();
  else stopHeroTypewriter();
}

async function checkHealth() {
  const apiStatus = document.querySelector('#api-status');
  if (!apiStatus) return;
  try {
    await api('/api/health');
    apiStatus.classList.add('is-online');
  } catch {
    apiStatus.classList.add('is-error');
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `请求失败（${response.status}）`);
  return payload;
}

function field(label, control, span = false) {
  return `<label class="field ${span ? 'span-2' : ''}"><span>${label}</span>${control}</label>`;
}

function emptyBlock(title, message) {
  return `<div class="empty-block"><strong>${h(title)}</strong><span>${h(message)}</span></div>`;
}

function loadingTemplate(message) {
  return `<div class="loading-state"><span class="loading-ring"></span><strong>${h(message)}</strong></div>`;
}

function errorTemplate(message) {
  return `<div class="error-state">${icon('alert')}<h2>页面加载失败</h2><p>${h(message)}</p><button class="button primary" data-action="refresh">重新加载</button></div>`;
}

function icon(name, size = 18) {
  const filled = FILLED_ICONS.has(name);
  const paint = filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" ${paint} aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.overview}</svg>`;
}

function reportTypeLabel(value) {
  return { products: '商品表现', ads: '搜索词', inventory: '库存', after_sales: '退货/评论' }[value] || value;
}

function activityTitle(value) {
  return { import: '报表导入', import_preview: '导入预览', import_commit: '确认入库', import_cancel: '取消导入', action: '动作引擎', after_sale: '售后处理', report: '报告导出', create: '创建动作', update: '更新动作' }[value] || '运营动态';
}

function isClosedAction(status) {
  return ['done', 'closed', 'ignored'].includes(status);
}

function actionCloseRate(actions) {
  if (!actions.length) return 0;
  return Math.round((actions.filter((item) => isClosedAction(item.status)).length / actions.length) * 100);
}

function money(value, currency = '€') {
  return `${currency || ''} ${Number(value || 0).toFixed(2)}`.trim();
}

function number(value) {
  return new Intl.NumberFormat('zh-CN').format(Number(value) || 0);
}

function relativeTime(value) {
  if (!value) return '-';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '-';
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function shortDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function h(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return h(value).replaceAll('`', '&#096;');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function showError(error) {
  showToast(error.message || '操作失败', 'error');
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result).split(',')[1] || ''));
    reader.addEventListener('error', () => reject(new Error('文件读取失败')));
    reader.readAsDataURL(file);
  });
}

function readFontMode() {
  try {
    return localStorage.getItem('opsflow-font-mode') === 'original' ? 'original' : 'literary';
  } catch {
    return 'literary';
  }
}

function applyFontMode(mode) {
  const nextMode = mode === 'original' ? 'original' : 'literary';
  document.documentElement.dataset.fontMode = nextMode;
  try {
    localStorage.setItem('opsflow-font-mode', nextMode);
  } catch {}
  if (fontToggle) {
    fontToggle.title = nextMode === 'literary' ? '当前：文艺字体，点击切换原版字体' : '当前：原版字体，点击切换文艺字体';
    fontToggle.setAttribute('aria-pressed', String(nextMode === 'original'));
  }
  return nextMode;
}

function initFontToggle() {
  if (!fontToggle) return;
  fontToggle.addEventListener('click', () => applyFontMode(readFontMode() === 'literary' ? 'original' : 'literary'));
}

function initSakura() {
  const layer = document.querySelector('#sakura-layer');
  if (!layer || layer.childElementCount) return;
  layer.innerHTML = Array.from({ length: 28 }, (_, index) => {
    const left = (index * 37 + 9) % 100;
    const size = 7 + ((index * 5) % 7);
    const drift = 24 + ((index * 29) % 72);
    const duration = 13 + ((index * 7) % 12);
    const delay = -((index * 11) % 19);
    return `<span class="sakura-petal" style="--left:${left}%;--size:${size}px;--drift:${drift}px;--duration:${duration}s;--delay:${delay}s"></span>`;
  }).join('');
}

function initAppHeader() {
  if (!appHeader || !navProgress) return;
  const scrollElement = document.scrollingElement || document.documentElement;
  let scheduled = false;
  const update = () => {
    const maxScroll = Math.max(0, scrollElement.scrollHeight - window.innerHeight);
    const progress = maxScroll ? Math.min(1, window.scrollY / maxScroll) : 0;
    appHeader.classList.toggle('is-scrolled', window.scrollY > 8);
    navProgress.style.transform = `scaleX(${progress})`;
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  const observer = new MutationObserver(update);
  observer.observe(app, { childList: true, subtree: true });
  update();
}

function initNavTools() {
  if (!document.querySelector('link[href="/nav-shell.css"]')) {
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = '/nav-shell.css';
    document.head.append(styleLink);
  }

  const toolGroups = Array.from(document.querySelectorAll('.nav-tools'));
  const setters = new Map();
  toolGroups.forEach((tools) => {
    const trigger = tools.querySelector('.nav-tools-trigger');
    const menu = tools.querySelector('.nav-tools-menu');
    if (!trigger || !menu) return;
    const positionMenu = () => {
      if (window.innerWidth > 760) {
        tools.style.removeProperty('--nav-tools-menu-left');
        return;
      }
      const gutter = 12;
      const width = menu.offsetWidth || 252;
      const triggerRect = trigger.getBoundingClientRect();
      const groupRect = tools.getBoundingClientRect();
      const centeredLeft = triggerRect.left + triggerRect.width / 2 - width / 2;
      const viewportLeft = Math.min(window.innerWidth - gutter - width, Math.max(gutter, centeredLeft));
      tools.style.setProperty('--nav-tools-menu-left', `${Math.round(viewportLeft - groupRect.left)}px`);
    };
    const setOpen = (open, suppress = true) => {
      if (open) positionMenu();
      tools.classList.toggle('is-suppressed', suppress && !open);
      tools.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };
    setters.set(tools, setOpen);
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const next = !tools.classList.contains('is-open');
      toolGroups.forEach((group) => setters.get(group)?.(false));
      setOpen(next);
    });
    menu.querySelectorAll('[data-nav]').forEach((item) => item.addEventListener('click', () => setOpen(false)));
    tools.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (!tools.contains(document.activeElement)) setOpen(false);
      }, 0);
    });
    tools.addEventListener('mouseenter', () => {
      positionMenu();
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) trigger.setAttribute('aria-expanded', 'true');
    });
    window.addEventListener('resize', positionMenu);
    tools.addEventListener('mouseleave', () => {
      tools.classList.remove('is-suppressed');
      if (!tools.classList.contains('is-open')) trigger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', (event) => {
    toolGroups.forEach((tools) => {
      if (!tools.contains(event.target)) setters.get(tools)?.(false);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setters.forEach((setOpen) => setOpen(false));
  });
}
function scrollToContentStart() {
  const contentAnchor = document.querySelector('.page-frame');
  if (!contentAnchor) return;

  const headerOffset = (appHeader?.getBoundingClientRect().height || 0) + 22;
  const targetTop = contentAnchor.getBoundingClientRect().top + window.scrollY - headerOffset;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' });
}
