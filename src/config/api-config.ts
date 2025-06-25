import { fetchAuthSession } from 'aws-amplify/auth';

// BASE CLOUD URL
export const BASE_URL = import.meta.env.VITE_BASE_CLOUD_URL 
export const BASE_AUTH_URL = import.meta.env.VITE_BASE_CLOUD_URL + "/auth"

// Headers for API requests
export const getHeaders = async () => {
    const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {}

    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache",
        ...(accessToken && { Authorization: `Bearer ${idToken}` })
    };

};
