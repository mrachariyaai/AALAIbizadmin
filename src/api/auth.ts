
// BASE CLOUD URL
const BASE_AUTH_URL = import.meta.env.VITE_BASE_CLOUD_URL + "/auth"

// Function to genberate QR Code
export const fetchQRSessionId = async () => {
    
    try {
        const response = await fetch(BASE_AUTH_URL+"/generate-qr-session",{
            method: 'POST',
            body: JSON.stringify({})
        })
        const data = await response.json()
        return data.sessionId
    } catch (error) {
        console.log("FetchQR Error: ", error)
        return ""
    }
}

// Function to check the status of QR based login
export const checkQRScanStatus = async (sessionId:string) => {

    try {
        console.log("Session id: ", sessionId)
        const response = await fetch(`${BASE_AUTH_URL}/check-qr-session?sessionId=${sessionId}`, {
            method: 'GET',
        })
        const data = await response.json()
        console.log("QR status: ", data)
        return data
    } catch (error ) {
        console.log("Error fetching QR status")
        return {}
    }

}