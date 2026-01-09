export const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;
export const SUBSCRIBE_TO_CHALLENGE_URL = `${BASE_URL}/challenges/subscribe`;
export const MINE_TASKS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/tasks/self`;

const isStaging = process.env.NEXT_PUBLIC_BASE_URL?.includes('staging');
const envPrefix = isStaging ? 'staging-' : '';

export const USER_PROFILE_URL = `https://${envPrefix}my.realdevsquad.com/profile`;
export const HOME_URL = `https://${envPrefix}realdevsquad.com`;
export const WELCOME_URL = `https://${envPrefix}welcome.realdevsquad.com`;
export const EVENTS_URL = `https://${envPrefix}www.realdevsquad.com/events`;
export const CRYPTO_URL = `https://${envPrefix}crypto.realdevsquad.com`;
export const STATUS_URL = `https://${envPrefix}status.realdevsquad.com`;
export const LOGIN_URL = `https://github.com/login/oauth/authorize?client_id=23c78f66ab7964e5ef97&state=${STATUS_URL}`;
export const MEMBERS_URL = `https://${envPrefix}members.realdevsquad.com`;
export const CHALLENGES_URL = `${BASE_URL}/challenges`;
export const USER_SELF = `${BASE_URL}/users?profile=true`;
export const USERS_IDLE = `${BASE_URL}/users/search?state=IDLE`;
export const DEFAULT_AVATAR = '/Avatar.png';
export const RDS_LOGO = '/RDSLogo.png';
export const GITHUB_LOGO = '/github-white.png';
export const SIGNUP_LINK = `https://${envPrefix}www.realdevsquad.com/new-signup`;
export const LOGOUT_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signout`;
export const IDLE_USERS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/users/status?state=IDLE`;
export const ITEM_BY_FILTER_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/items/filter`;
export const ITEMS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/items`;
export const ALL_TAGS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/tags`;
export const ALL_LEVELS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/levels`;
export const ITEM_TYPES = { task: 'TASK' };
export const TASKS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/tasks`;
// TODO : Rename task requests url GITHUB: @Ajeyakrishna-k https://github.com/Real-Dev-Squad/website-backend/issues/1599
export const TASK_REQUEST_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/taskRequests`;
export const ISSUES_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/issues`;
export const USERS_URL = `${BASE_URL}/users`;
export const MAIN_SITE_URL = `https://${envPrefix}www.realdevsquad.com`;
export const DASHBOARD_URL = `https://${envPrefix}dashboard.realdevsquad.com`;
export const USER_MANAGEMENT_URL = `${DASHBOARD_URL}/users/details/`;
export const TASK_REQUESTS_DETAILS_URL = `${DASHBOARD_URL}/task-requests/details/`;
export const TASK_EXTENSION_REQUEST_URL = `${DASHBOARD_URL}/extension-requests/`;
