import { ref, onMounted, onUnmounted } from 'vue';
import { checkInternetConnection } from './checkInternetConnection';

export const useInternetConnection = () => {
    const isOnline = ref(navigator.onLine);

    const updateOnlineStatus = () => {
        checkInternetConnection().then((status) => {
            isOnline.value = status;
        });
    };

    onMounted(() => {
        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);
        updateOnlineStatus();
    })

    onUnmounted(() => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
    })

    return { isOnline };
}