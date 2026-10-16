// Коды пользовательских полей сделки (воронка «Проекты», CATEGORY_ID = 2).
// Сверены с выгрузкой полей портала nordsrub.bitrix24.ru (см. раздел 4.1 ТЗ).
export const DEAL_CATEGORY_PROJECTS = 2;

export const DEAL_FIELDS = {
  project: 'UF_CRM_1701762205698', // Проект (строка), например «Мюнхен»
  material: 'UF_CRM_AMO_567635', // Материал (строка)
  area: 'UF_CRM_1706679289939', // Площадь проекта, м² (число)
  address: 'UF_CRM_1701843708399', // Адрес участка (тип address)
  contractNumber: 'UF_CRM_1706534828948', // Номер договора
  contractDeadline: 'UF_CRM_1701762192777', // Срок строительства по договору (дата)
  albumAr: 'UF_CRM_1701844074752', // Альбом АР (файл)
  photosFolder: 'UF_CRM_1708611723179', // Фотографии с объекта (ссылки)
} as const;

// Поля-сотрудники сделки. Порядок = порядок в списке команды.
export const TEAM_FIELDS = [
  { field: 'ASSIGNED_BY_ID', role: 'Менеджер проекта' },
  { field: 'UF_CRM_1703837502', role: 'Прораб' },
  { field: 'UF_CRM_1703837445', role: 'Архитектор' },
  { field: 'UF_CRM_1703837464', role: 'Конструктор' },
  { field: 'UF_CRM_1703837476', role: 'Сметчик' },
  { field: 'UF_CRM_1703837488', role: 'Снабженец' },
  { field: 'UF_CRM_1717081308', role: 'Координатор' },
] as const;
