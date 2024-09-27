

export default function Clips({clipPos,clips}) {

    return (
        <section className="clips-section">
            <iframe
                id="twitch-player"
                className="twitch--player"
                src={clips[clipPos].embed_url + `&parent=localhost&autoplay=true`}
                allowFullScreen>
            </iframe>
        </section>
    )
}