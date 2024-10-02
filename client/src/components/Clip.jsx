
export default function Clip({clipData, autoplay}) {
    let src = clipData.embed_url
    src += `&parent=localhost`
    if (autoplay) src += `&autoplay=true`

    return (
        <iframe
            id="twitch-player"
            className="twitch-player"
            src={src}
            allowFullScreen>
        </iframe>
    )
}