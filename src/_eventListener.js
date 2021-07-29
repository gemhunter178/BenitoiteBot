import { ApiClient } from 'twitch';
import { StaticAuthProvider } from 'twitch-auth';



const authProvider = new StaticAuthProvider( CLIENT_ID , OAUTH_TOKEN );
const apiClient = new ApiClient({ authProvider });