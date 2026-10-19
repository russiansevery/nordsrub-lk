// Наполнение разделов в демо-режиме: тестовый объект «Мюнхен». Живые данные придут из Битрикса и Диска.

export type DemoPhoto = { src: string; position: string };

const RENDER = '/demo/render.webp';
const FACADE = '/demo/facade.webp';
const crops = ['center 35%', 'left 60%', 'right 40%', 'center 80%', 'left 20%', 'right 85%', 'center 10%', '30% 50%'];
const photos = (n: number, offset = 0): DemoPhoto[] =>
  Array.from({ length: n }, (_, i) => ({ src: (i + offset) % 3 === 2 ? FACADE : RENDER, position: crops[(i + offset) % crops.length] }));

export type ChatMessage =
  | { kind: 'event'; id: string; text: string; time: string }
  | { kind: 'doc'; id: string; text: string; time: string }
  | { kind: 'report'; id: string; author: string; stage: string; text: string; photos: DemoPhoto[]; total: number; time: string }
  | { kind: 'msg'; id: string; author: string; mine?: boolean; quote?: string; text: string; files?: number; time: string };

export const demoChat: ChatMessage[] = [
  { kind: 'event', id: 'e1', text: 'Этап «Стены» завершён, начат этап «Кровля»', time: '12 окт' },
  { kind: 'doc', id: 'd1', text: 'Акт выполненных работ: каркас', time: '12 окт' },
  {
    kind: 'report', id: 'r1', author: 'Иван Петров, прораб', stage: 'Кровля', total: 12, time: '14 окт, 18:38',
    text: 'Добрый день. Ведём монтаж стропильной системы, к выходным закроем контур мембраной.', photos: photos(5),
  },
  { kind: 'msg', id: 'm1', author: 'Вы', mine: true, quote: 'Иван Петров: Ведём монтаж стропильной системы…', text: 'Отлично получается, спасибо!', time: '14 окт, 18:44' },
  { kind: 'msg', id: 'm2', author: 'Ольга Смирнова, менеджер', text: 'Напоминаю: до 20 октября нужно выбрать цвет металлочерепицы. Образцы во вложении к этапу.', time: '15 окт, 10:02' },
  { kind: 'msg', id: 'm3', author: 'Вы', mine: true, text: '@Ольга_Смирнова выбрали графит RAL 7024, подтверждаю.', time: '15 окт, 12:30' },
  { kind: 'event', id: 'e2', text: 'Ольга Смирнова ответила на вопрос клиента', time: '15 окт' },
  { kind: 'msg', id: 'm4', author: 'Ольга Смирнова, менеджер', text: 'Приняла, передала в снабжение. Поставка черепицы 24 октября.', time: '15 окт, 12:41' },
];

export type GalleryStage = { stage: string; reports: number; files: number; photos: DemoPhoto[] };

export const demoGallery: GalleryStage[] = [
  { stage: 'Кровля', reports: 2, files: 21, photos: photos(8) },
  { stage: 'Стены', reports: 5, files: 64, photos: photos(8, 3) },
  { stage: 'Фундамент', reports: 2, files: 18, photos: photos(6, 5) },
];

export type DemoDoc = { section: 'contract' | 'estimate' | 'act' | 'project'; name: string; date: string; status: string; file: string; pending?: boolean };

export const DOC_SECTIONS = { contract: 'Договоры', estimate: 'Сметы и оплаты', act: 'Акты', project: 'Проект' } as const;

export const demoDocs: DemoDoc[] = [
  { section: 'contract', name: 'Договор подряда № 0412', file: '/demo/docs/dogovor-0412.pdf', date: '20 июня', status: 'Подписан' },
  { section: 'contract', name: 'Дополнительное соглашение № 1', file: '/demo/docs/dopsoglashenie-1.pdf', date: '1 августа', status: 'Подписан' },
  { section: 'estimate', name: 'Подписанная смета', file: '/demo/docs/smeta.pdf', date: '20 июня', status: 'Подписан' },
  { section: 'estimate', name: 'График оплат', file: '/demo/docs/grafik-oplat.pdf', date: '20 июня', status: 'Подписан' },
  { section: 'act', name: 'Акт: фундамент', file: '/demo/docs/akt-fundament.pdf', date: '28 июля', status: 'Подписан' },
  { section: 'act', name: 'Акт: каркас', file: '/demo/docs/akt-karkas.pdf', date: '12 октября', status: 'На подписании', pending: true },
  { section: 'project', name: 'Альбом АР', file: '/demo/docs/albom-ar.pdf', date: '9 июня', status: 'Согласован' },
  { section: 'project', name: 'Альбом КД', file: '/demo/docs/albom-kd.pdf', date: '9 июня', status: 'Согласован' },
];

export const demoChecklist = {
  title: 'Чек-лист: подготовка к кровле',
  items: [
    { text: 'Освободить подъезд для манипулятора', done: true },
    { text: 'Обеспечить электричество на участке', done: true },
    { text: 'Выбрать цвет металлочерепицы', done: true },
    { text: 'Согласовать дату поставки материалов', done: false },
  ],
};

export const demoMaterials: { title: string; points: string[] }[] = [
  {
    title: 'Эксплуатация дома из клеёного бруса',
    points: [
      'Первые два отопительных сезона дом даёт естественную усадку около 1–2 %. Это нормально, регулировочные узлы на это рассчитаны.',
      'Держите влажность в доме 40–60 %, зимой помогает увлажнитель.',
      'Первый год не включайте отопление на полную мощность сразу, поднимайте температуру постепенно.',
    ],
  },
  {
    title: 'Как принимать этап',
    points: [
      'Прораб приглашает на приёмку, когда этап готов. Дата приходит в чат проекта.',
      'Сверьте работы со сметой и проектом, задайте вопросы прямо на объекте.',
      'Замечания фиксируются в акте, после устранения акт подписывается в разделе «Документы».',
    ],
  },
  {
    title: 'Сезонный уход',
    points: [
      'Весной осмотрите фасад и обработайте участки, где покрытие потеряло цвет.',
      'Осенью прочистите водостоки и проверьте отмостку.',
      'Раз в 5–7 лет обновляйте защитное покрытие фасада.',
    ],
  },
  {
    title: 'Гарантия',
    points: [
      'Сроки гарантии на конструктив и инженерные системы указаны в договоре подряда.',
      'Гарантийный случай оформляется через менеджера проекта или раздел «Написать руководству».',
    ],
  },
];
