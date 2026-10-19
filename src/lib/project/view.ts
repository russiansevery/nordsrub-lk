import { DEAL_FIELDS, TEAM_FIELDS } from '../bitrix/fields';
import { buildTimeline, type StageHistoryEntry, type Timeline } from './timeline';

export type TeamMember = { userId: string; name: string; role: string; phone?: string };

export type ProjectView = {
  dealId: number;
  projectName: string;
  contractNumber: string;
  material: string;
  area: number | null;
  floors: number | null;
  address: string;
  coverUrl: string | null;
  timeline: Timeline;
  team: TeamMember[];
  foreman: TeamMember | null;
  manager: TeamMember | null;
  demo: boolean;
};

export type RawDeal = {
  deal: Record<string, unknown>;
  stageNames: Record<string, string>;
  history: StageHistoryEntry[];
  users: Record<string, { NAME?: string; LAST_NAME?: string; PHONE?: string }>;
};

export function buildProjectView(raw: RawDeal, today: Date, opts: { demo?: boolean; coverUrl?: string | null; floors?: number | null } = {}): ProjectView {
  const { deal } = raw;
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');

  const team: TeamMember[] = [];
  const seen = new Set<string>();
  for (const { field, role } of TEAM_FIELDS) {
    const id = str(deal[field]);
    if (!id || id === '0' || seen.has(`${id}:${role}`)) continue;
    const u = raw.users[id];
    if (!u) continue;
    seen.add(`${id}:${role}`);
    const member: TeamMember = { userId: id, role, name: [u.NAME, u.LAST_NAME].filter(Boolean).join(' ').trim() || 'Сотрудник' };
    // Клиенту показываем телефон только менеджера проекта.
    if (field === 'ASSIGNED_BY_ID' && u.PHONE) member.phone = u.PHONE;
    team.push(member);
  }

  const areaNum = Number(str(deal[DEAL_FIELDS.area]).replace(',', '.'));

  return {
    dealId: Number(deal.ID),
    projectName: str(deal[DEAL_FIELDS.project]) || str(deal.TITLE),
    contractNumber: str(deal[DEAL_FIELDS.contractNumber]),
    material: str(deal[DEAL_FIELDS.material]),
    area: Number.isFinite(areaNum) && areaNum > 0 ? areaNum : null,
    floors: opts.floors ?? null,
    address: parseAddress(deal[DEAL_FIELDS.address]),
    coverUrl: opts.coverUrl ?? null,
    timeline: buildTimeline({ currentStageId: str(deal.STAGE_ID), stageNames: raw.stageNames, history: raw.history, today }),
    team,
    foreman: team.find((m) => m.role === 'Прораб') ?? null,
    manager: team.find((m) => m.role === 'Менеджер проекта') ?? null,
    demo: Boolean(opts.demo),
  };
}

/** Поле типа «адрес» приходит строкой вида «Адрес|55.75;37.61|123». Берём только текст. */
export function parseAddress(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.split('|')[0].trim();
}
