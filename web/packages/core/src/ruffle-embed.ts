import {
    isBuiltInContextMenuVisible,
    isFallbackElement,
    isScriptAccessAllowed,
    isYoutubeFlashSource,
    workaroundYoutubeMixedContent,
    RufflePlayer,
} from "./ruffle-player";
import { WindowMode } from "./load-options";
import { registerElement } from "./register-element";
import { isSwfFilename, isSwfMimeType } from "./swf-utils";

/**
 * A polyfill html element.
 *
 * This specific class tries to polyfill existing `<embed>` tags,
 * and should not be used. Prefer [[RufflePlayer]] instead.
 *
 * @internal
 */
export class RuffleEmbed extends RufflePlayer {
    /**
     * Constructs a new Ruffle flash player for insertion onto the page.
     *
     * This specific class tries to polyfill existing `<embed>` tags,
     * and should not be used. Prefer [[RufflePlayer]] instead.
     */
    constructor() {
        super();
    }

    /**
     * @ignore
     * @internal
     */
    override connectedCallback(): void {
        super.connectedCallback();
        const src = this.attributes.getNamedItem("src");
        if (src) {
            const allowScriptAccess =
                this.attributes.getNamedItem("allowScriptAccess")?.value ??
                null;
            const menu = this.attributes.getNamedItem("menu")?.value ?? null;

            // Kick off the SWF download.
            this.load({
                url: src.value,
                allowScriptAccess: isScriptAccessAllowed(
                    allowScriptAccess,
                    src.value
                ),
                parameters:
                    this.attributes.getNamedItem("flashvars")?.value ?? null,
                backgroundColor:
                    this.attributes.getNamedItem("bgcolor")?.value ?? null,
                base: this.attributes.getNamedItem("base")?.value ?? null,
                menu: isBuiltInContextMenuVisible(menu),
                salign: this.attributes.getNamedItem("salign")?.value ?? "",
                quality:
                    this.attributes.getNamedItem("quality")?.value ?? "high",
                scale:
                    this.attributes.getNamedItem("scale")?.value ?? "showAll",
                wmode:
                    (this.attributes.getNamedItem("wmode")
                        ?.value as WindowMode) ?? WindowMode.Window,
            });
        }
    }

    /**
     * Polyfill of HTMLObjectElement.
     *
     * @ignore
     * @internal
     */
    get src(): string | undefined {
        return this.attributes.getNamedItem("src")?.value;
    }

    /**
     * Polyfill of HTMLObjectElement.
     *
     * @ignore
     * @internal
     */
    set src(srcval: string | undefined) {
        if (srcval) {
            const attr = document.createAttribute("src");
            attr.value = srcval;
            this.attributes.setNamedItem(attr);
        } else {
            this.attributes.removeNamedItem("src");
        }
    }

    /**
     * @ignore
     * @internal
     */
    static override get observedAttributes(): string[] {
        return ["src", "width", "height"];
    }

    /**
     * @ignore
     * @internal
     */
    override attributeChangedCallback(
        name: string,
        oldValue: string | undefined,
        newValue: string | undefined
    ): void {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (this.isConnected && name === "src") {
            const src = this.attributes.getNamedItem("src");
            if (src) {
                this.load({
                    url: src.value,
                    parameters:
                        this.attributes.getNamedItem("flashvars")?.value ??
                        null,
                    base: this.attributes.getNamedItem("base")?.value ?? null,
                });
            }
        }
    }

    /**
     * Checks if the given element may be polyfilled with this one.
     *
     * @param elem Element to check.
     * @returns True if the element looks like a flash embed.
     */
    static isInterdictable(elem: Element): boolean {
        // Don't polyfill if the element is inside a specific node.
        if (isFallbackElement(elem)) {
            return false;
        }
        // Don't polyfill when no file is specified.
        if (!elem.getAttribute("src")) {
            return false;
        }
        // Don't polyfill when the file is a Youtube Flash source.
        if (isYoutubeFlashSource(elem.getAttribute("src"))) {
            // Workaround YouTube mixed content; this isn't what browsers do automatically, but while we're here, we may as well
            workaroundYoutubeMixedContent(elem, "src");
            return false;
        }

        // Check for MIME type.
        const type = elem.getAttribute("type");
        if (!type) {
            // If no MIME type is specified, polyfill if movie is an SWF file.
            return isSwfFilename(elem.getAttribute("src"));
        } else {
            return isSwfMimeType(type);
        }
    }

    /**
     * Creates a RuffleEmbed that will polyfill and replace the given element.
     *
     * @param elem Element to replace.
     * @returns Created RuffleEmbed.
     */
    static fromNativeEmbedElement(elem: Element): RuffleEmbed {
        const externalName = registerElement("ruffle-embed", RuffleEmbed);
        const ruffleObj = <RuffleEmbed>document.createElement(externalName);
        ruffleObj.copyElement(elem);

        return ruffleObj;
    }
}
