export function downloadJSON(json: string, defaultFilename: string) {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.visibility = "hidden";
    a.download = defaultFilename;
    a.href = url;
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}

export async function uploadJSON(fileList: FileList): Promise<string | null> {
    if (fileList.length === 1) {
        const file = fileList[0];
        try {
            const json = await file.text();

            return json;
        } catch {
            return null;
        }
    }

    return null;
}
