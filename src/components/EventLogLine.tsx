import { portraitUrl } from "../lib/avatar";
import { districtAccentColor } from "../lib/districts";
import { tributesForEvent } from "../lib/eventFaces";
import type { GameEvent, Tribute } from "../types";
import { ColoredEventText } from "./ColoredEventText";

type EventLogLineProps = {
  event: GameEvent;
  tributes: readonly Tribute[];
  isNew?: boolean;
};

export function EventLogLine({ event, tributes, isNew = false }: EventLogLineProps) {
  const faces = tributesForEvent(event, tributes);
  const victimIds = new Set(event.victimIds);

  return (
    <div className={`feed-line kind-${event.kind} phase-${event.phase}${isNew ? " is-new" : ""}`}>
      {faces.length > 0 ? (
        <div className="feed-faces">
          {faces.map((tribute) => {
            const accent = districtAccentColor(tribute.district);
            const dimmed = event.kind === "kill" && victimIds.has(tribute.id);
            return (
              <figure key={tribute.id} className={`feed-face-card${dimmed ? " is-fallen" : ""}`}>
                <div className="feed-face-frame" style={{ boxShadow: `0 0 0 1px ${accent}` }}>
                  <img
                    className="feed-face"
                    src={portraitUrl(tribute.imageUrl, tribute.name)}
                    alt=""
                    width={144}
                    height={144}
                    referrerPolicy="no-referrer"
                  />
                  {dimmed ? <span className="fallen-mark" aria-hidden="true" /> : null}
                </div>
                <figcaption className="feed-face-name" style={{ color: accent }}>
                  {tribute.name}
                </figcaption>
              </figure>
            );
          })}
        </div>
      ) : null}
      <p className="feed-line-text">
        <ColoredEventText text={event.text} tributes={tributes} />
      </p>
    </div>
  );
}
