export const checkInternetConnection = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const isOnline = navigator.onLine;
        if (isOnline) {
            fetch(`https://www.google.com`, { mode: "no-cors" })
            .then(() => resolve(true))
            .catch(() => resolve(false))
        } else {
            resolve(false)
        }
    })
}