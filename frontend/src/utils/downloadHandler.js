export const downloadHandler = async (url) => {
    try {
        const link = document.createElement("a");
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        return error;
    }
}
