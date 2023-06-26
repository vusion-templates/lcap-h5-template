function noop() {
    return '';
}
const noSupport = {
    set: noop,
    get: noop,
    remove: noop,
    clear: noop,
};

const isLocalStorageAvailable = () => {
    try {
        const key = 'testlocastorage';
        window.localStorage.setItem(key, '1');
        window.localStorage.removeItem(key);

        return true;
    } catch (error) {
        return false;
    }
};

const storage = isLocalStorageAvailable() ? window.localStorage : null;

const storageObj = !storage ? noSupport : {
    set(key, value, enableStringify = false) {
        try {
            storage.setItem(key, enableStringify ? JSON.stringify(value) : value);
        } catch (error) {
            console.error('JSON stringify error:', error);
        }
    },
    get(key, enableParseJson = false) {
        const value = storage.getItem(key);
        if (enableParseJson) {
            try {
                return JSON.parse(value);
            } catch (error) {
                console.error('JSON parsing error:', error);
                return null;
            }
        } else {
            return value;
        }
    },
    remove(key) {
        return storage.removeItem(key);
    },
    clear() {
        storage.clear();
    },
};

export default storageObj;

