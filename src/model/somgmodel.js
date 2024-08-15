// To parse this data:
//
//   const Convert = require("./file");
//
//   const songModel = Convert.toSongModel(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toSongModel(json) {
    return cast(JSON.parse(json), r("SongModel"));
}

function songModelToJson(value) {
    return JSON.stringify(uncast(value, r("SongModel")), null, 2);
}

function invalidValue(typ, val, key, parent = '') {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ) {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '', parent = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}

function l(typ) {
    return { literal: typ };
}

function a(typ) {
    return { arrayItems: typ };
}

function u(...typs) {
    return { unionMembers: typs };
}

function o(props, additional) {
    return { props, additional };
}

function m(additional) {
    return { props: [], additional };
}

function r(name) {
    return { ref: name };
}

const typeMap = {
    "SongModel": o([
        { json: "albums", js: "albums", typ: r("Albums") },
        { json: "artists", js: "artists", typ: r("SongModelArtists") },
        { json: "episodes", js: "episodes", typ: r("Episodes") },
        { json: "genres", js: "genres", typ: r("Albums") },
        { json: "playlists", js: "playlists", typ: r("Playlists") },
        { json: "podcasts", js: "podcasts", typ: r("Podcasts") },
        { json: "topResults", js: "topResults", typ: r("TopResults") },
        { json: "tracks", js: "tracks", typ: r("Tracks") },
        { json: "users", js: "users", typ: r("Users") },
    ], false),
    "Albums": o([
        { json: "totalCount", js: "totalCount", typ: 0 },
        { json: "items", js: "items", typ: a(r("AlbumsItem")) },
    ], false),
    "AlbumsItem": o([
        { json: "data", js: "data", typ: r("PurpleData") },
    ], false),
    "PurpleData": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "artists", js: "artists", typ: r("DataArtists") },
        { json: "coverArt", js: "coverArt", typ: r("CoverArt") },
        { json: "date", js: "date", typ: r("Date") },
    ], false),
    "DataArtists": o([
        { json: "items", js: "items", typ: a(r("PurpleItem")) },
    ], false),
    "PurpleItem": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "profile", js: "profile", typ: r("Profile") },
    ], false),
    "Profile": o([
        { json: "name", js: "name", typ: "" },
    ], false),
    "CoverArt": o([
        { json: "sources", js: "sources", typ: a(r("Source")) },
    ], false),
    "Source": o([
        { json: "url", js: "url", typ: "" },
        { json: "width", js: "width", typ: u(0, null) },
        { json: "height", js: "height", typ: u(0, null) },
    ], false),
    "Date": o([
        { json: "year", js: "year", typ: 0 },
    ], false),
    "SongModelArtists": o([
        { json: "totalCount", js: "totalCount", typ: 0 },
        { json: "items", js: "items", typ: a(r("FluffyItem")) },
    ], false),
    "FluffyItem": o([
        { json: "data", js: "data", typ: r("FluffyData") },
    ], false),
    "FluffyData": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "profile", js: "profile", typ: r("Profile") },
        { json: "visuals", js: "visuals", typ: r("Visuals") },
    ], false),
    "Visuals": o([
        { json: "avatarImage", js: "avatarImage", typ: r("CoverArt") },
    ], false),
    "Episodes": o([
        { json: "totalCount", js: "totalCount", typ: 0 },
        { json: "items", js: "items", typ: a(r("EpisodesItem")) },
    ], false),
    "EpisodesItem": o([
        { json: "data", js: "data", typ: r("TentacledData") },
    ], false),
    "TentacledData": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "coverArt", js: "coverArt", typ: r("CoverArt") },
        { json: "duration", js: "duration", typ: r("Duration") },
        { json: "releaseDate", js: "releaseDate", typ: r("ReleaseDate") },
        { json: "podcast", js: "podcast", typ: r("Podcast") },
        { json: "description", js: "description", typ: "" },
        { json: "contentRating", js: "contentRating", typ: r("ContentRating") },
    ], false),
    "ContentRating": o([
        { json: "label", js: "label", typ: "" },
    ], false),
    "Duration": o([
        { json: "totalMilliseconds", js: "totalMilliseconds", typ: 0 },
    ], false),
    "Podcast": o([
        { json: "coverArt", js: "coverArt", typ: r("CoverArt") },
    ], false),
    "ReleaseDate": o([
        { json: "isoString", js: "isoString", typ: Date },
    ], false),
    "Playlists": o([
        { json: "totalCount", js: "totalCount", typ: 0 },
        { json: "items", js: "items", typ: a(r("PlaylistsItem")) },
    ], false),
    "PlaylistsItem": o([
        { json: "data", js: "data", typ: r("StickyData") },
    ], false),
    "StickyData": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "images", js: "images", typ: r("Images") },
        { json: "owner", js: "owner", typ: r("Profile") },
    ], false),
    "Images": o([
        { json: "items", js: "items", typ: a(r("CoverArt")) },
    ], false),
    "Podcasts": o([
        { json: "totalCount", js: "totalCount", typ: 0 },
        { json: "items", js: "items", typ: a(r("PodcastsItem")) },
    ], false),
    "PodcastsItem": o([
        { json: "data", js: "data", typ: r("IndigoData") },
    ], false),
    "IndigoData": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "coverArt", js: "coverArt", typ: r("CoverArt") },
        { json: "type", js: "type", typ: "" },
        { json: "publisher", js: "publisher", typ: r("Profile") },
        { json: "mediaType", js: "mediaType", typ: "" },
    ], false),
    "TopResults": o([
        { json: "items", js: "items", typ: a(r("TopResultsItem")) },
        { json: "featured", js: "featured", typ: a("any") },
    ], false),
    "TopResultsItem": o([
        { json: "data", js: "data", typ: r("IndecentData") },
    ], false),
    "IndecentData": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "albumOfTrack", js: "albumOfTrack", typ: r("AlbumOfTrack") },
        { json: "artists", js: "artists", typ: r("DataArtists") },
        { json: "contentRating", js: "contentRating", typ: r("ContentRating") },
        { json: "duration", js: "duration", typ: r("Duration") },
        { json: "playability", js: "playability", typ: r("Playability") },
    ], false),
    "AlbumOfTrack": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "coverArt", js: "coverArt", typ: r("CoverArt") },
        { json: "id", js: "id", typ: "" },
        { json: "sharingInfo", js: "sharingInfo", typ: r("SharingInfo") },
    ], false),
    "SharingInfo": o([
        { json: "shareUrl", js: "shareUrl", typ: "" },
    ], false),
    "Playability": o([
        { json: "playable", js: "playable", typ: true },
    ], false),
    "Tracks": o([
        { json: "totalCount", js: "totalCount", typ: 0 },
        { json: "items", js: "items", typ: a(r("TopResultsItem")) },
    ], false),
    "Users": o([
        { json: "totalCount", js: "totalCount", typ: 0 },
        { json: "items", js: "items", typ: a(r("UsersItem")) },
    ], false),
    "UsersItem": o([
        { json: "data", js: "data", typ: r("HilariousData") },
    ], false),
    "HilariousData": o([
        { json: "uri", js: "uri", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "displayName", js: "displayName", typ: "" },
        { json: "username", js: "username", typ: "" },
        { json: "image", js: "image", typ: r("Image") },
    ], false),
    "Image": o([
        { json: "smallImageUrl", js: "smallImageUrl", typ: "" },
        { json: "largeImageUrl", js: "largeImageUrl", typ: "" },
    ], false),
};

module.exports = {
    "songModelToJson": songModelToJson,
    "toSongModel": toSongModel,
};
