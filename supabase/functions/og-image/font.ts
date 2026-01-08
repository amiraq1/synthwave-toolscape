export const loadFont = async () => {
    const response = await fetch(
        "https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Bold.ttf"
    );
    return await response.arrayBuffer();
};
