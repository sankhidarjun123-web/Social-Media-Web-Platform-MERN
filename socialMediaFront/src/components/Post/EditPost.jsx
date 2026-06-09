import React, { useState, useEffect, useRef } from "react";
import {
    Image,
    Smile,
    Clock,
    MapPin,
    ChevronDown,
    X
} from "lucide-react";

import EmojiPicker from "emoji-picker-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";

import { Country, State, City } from "country-state-city";

const EditPost = ({ editData, setEditData }) => {

    const SERVER = import.meta.env.VITE_SERVER_URL;

    const [text, setText] = useState("");
    const [media, setMedia] = useState([]);
    const [addedMedia, setAddedMedia] = useState([]);
    const [removedMedia, setRemovedMedia] = useState([]);

    const [location, setLocation] = useState("");
    const [openLocation, setOpenLocation] = useState(false);

    const [date, setDate] = useState("");

    const [visibility, setVisibility] = useState("Public");

    const [loading, setLoading] = useState(false);

    const [country, setCountry] = useState("");
    const [stateVal, setStateVal] = useState("");
    const [city, setCity] = useState("");

    const [showEmoji, setShowEmoji] = useState(false);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiRef = useRef(null);
    const locationRef = useRef(null);

    const countries = Country.getAllCountries();
    const states = country
        ? State.getStatesOfCountry(country)
        : [];

    const cities = stateVal
        ? City.getCitiesOfState(country, stateVal)
        : [];

    const DateSelector = React.forwardRef(({ value, onClick }, ref) => (
        <button
            onClick={onClick}
            ref={ref}
            className="flex justify-center items-center w-10 h-10 cursor-pointer"
        >
            <Clock size={20} />
        </button>
    ));

    // LOCK BODY SCROLL
    useEffect(() => {

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };

    }, []);

    // LOAD DATA
    useEffect(() => {

        if (editData) {

            setText(editData.text || "");

            setMedia(
                editData.media?.map((m) => m.url) || []
            );

            if (new Date(editData.date) < new Date()) {
                setDate("");
            } else {
                setDate(new Date(editData.date));
            }

            setLocation(editData?.location || "");

            setVisibility(
                editData?.visibility || "Public"
            );
        }

        // PRELOAD LOCATION
        if (editData?.location) {

            const brokenLoc = editData.location
                .split(",")
                .map((item) => item.trim());

            const cityName = brokenLoc[0];
            const stateName = brokenLoc[1];
            const countryName = brokenLoc[2];

            const countryObj = countries.find(
                (c) => c.name === countryName
            );

            const stateObj = State.getStatesOfCountry(
                countryObj?.isoCode || ""
            ).find((s) => s.name === stateName);

            setCity(cityName || "");

            setCountry(
                countryObj?.isoCode || ""
            );

            setStateVal(
                stateObj?.isoCode || ""
            );
        }

    }, [editData]);

    // OUTSIDE CLICK
    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                emojiRef.current &&
                !emojiRef.current.contains(e.target)
            ) {
                setShowEmoji(false);
            }

            if (
                locationRef.current &&
                !locationRef.current.contains(e.target)
            ) {
                setOpenLocation(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);

    // COMBINED MEDIA
    const combinedMedia = [

        ...media.map((m) => ({
            type: "old",
            src: m,
            mediaType: m.match(/\.(mp4|webm|ogg)$/i)
                ? "video"
                : "image"
        })),

        ...addedMedia.map((file) => ({
            type: "new",
            file,
            src: URL.createObjectURL(file),
            mediaType: file.type.startsWith("video/")
                ? "video"
                : "image"
        }))
    ];

    // TEXTAREA AUTO HEIGHT
    const handleInput = (e) => {

        setText(e.target.value);

        const el = textareaRef.current;

        if (el) {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        }
    };

    // FILES
    const handleFiles = (e) => {

        const selected = Array.from(e.target.files);

        const valid = selected.filter(
            (file) =>
                file.type.startsWith("image/") ||
                file.type.startsWith("video/")
        );

        setAddedMedia((prev) => [
            ...prev,
            ...valid
        ]);
    };

    // EMOJI
    const handleEmoji = (emojiData) => {

        setText(
            (prev) => prev + emojiData.emoji
        );
    };

    // REMOVE MEDIA
    const handleRemove = (item) => {

        if (item.type === "old") {

            setRemovedMedia((prev) => [
                ...prev,
                item.src
            ]);

            setMedia((prev) =>
                prev.filter((m) => m !== item.src)
            );

        } else {

            setAddedMedia((prev) =>
                prev.filter((f) => f !== item.file)
            );
        }
    };

    // DATE
    const handleDate = (d) => {

        const now = new Date();

        if (d < now) return;

        setDate(d);
    };

    const isFuturePost =
        date instanceof Date &&
        date > new Date();

    // LOCATION
    const handleSetLocation = () => {

        const selectedCountry = countries.find(
            (c) => c.isoCode === country
        )?.name;

        const selectedState = states.find(
            (s) => s.isoCode === stateVal
        )?.name;

        const finalLocation = [
            city,
            selectedState,
            selectedCountry
        ]
            .filter(Boolean)
            .join(", ");

        setLocation(finalLocation);

        setOpenLocation(false);
    };

    // CLOSE
    const handleClose = () => {

        document.body.style.overflow = "auto";

        setEditData(false);
    };

    // EDIT REQUEST
    const editRequest = async () => {

        setLoading(true);

        try {

            const formData = new FormData();

            formData.append("text", text);

            formData.append(
                "visibility",
                visibility
            );

            formData.append(
                "location",
                location
            );

            if (date) {
                formData.append("date", date);
            }

            formData.append(
                "removedMedia",
                JSON.stringify(removedMedia)
            );

            addedMedia.forEach((item) => {
                formData.append("media", item);
            });

            await axios.patch(
                `${SERVER}/userMedia/posts/${editData._id}`,
                formData,
                {
                    withCredentials: true
                }
            );

            handleClose();

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);
        }
    };

    return (

        <div
            className="
            bg-white rounded-2xl shadow-2xl
            w-[95vw] sm:w-[90vw] md:w-[750px]
            max-h-[90vh]
            overflow-y-auto
            p-4 sm:p-5
            mt-2
            "
            style={{ scrollbarWidth: "none" }}
        >

            {/* TITLE */}
            <h2 className="font-semibold text-2xl mb-4">
                Edit Post
            </h2>

            {/* MEDIA */}
            {combinedMedia.length > 0 && (

                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {combinedMedia.map((m, index) => (

                        <div
                            key={index}
                            className="relative rounded-2xl overflow-hidden"
                        >

                            {m.mediaType === "image" ? (

                                <img
                                    src={m.src}
                                    alt="media"
                                    className="
                                    w-full
                                    h-56 sm:h-44
                                    object-cover
                                    "
                                />

                            ) : (

                                <video
                                    src={m.src}
                                    controls
                                    className="
                                    w-full
                                    h-56 sm:h-44
                                    object-cover
                                    "
                                />
                            )}

                            <button
                                className="
                                absolute top-2 right-2
                                bg-black/60
                                text-white
                                p-1.5
                                rounded-full
                                hover:bg-black
                                transition
                                "
                                onClick={() =>
                                    handleRemove(m)
                                }
                            >
                                <X size={16} />
                            </button>

                        </div>
                    ))}
                </div>
            )}

            {/* TEXTAREA */}
            <textarea
                ref={textareaRef}
                value={text}
                maxLength={10000}
                onChange={handleInput}
                placeholder="What's in your mind today?"
                className="
                w-full resize-none outline-none
                text-gray-700 placeholder-gray-400
                bg-gray-50
                rounded-2xl
                p-4
                text-sm sm:text-base
                min-h-[120px]
                mb-4
                "
            />

            {/* VISIBILITY */}
            {visibility !== "Sheduled" && <div className="relative w-36 mb-3">

                <select
                    value={visibility}
                    onChange={(e) =>
                        setVisibility(e.target.value)
                    }
                    className="
                    w-full
                    bg-gray-100
                    rounded-full
                    px-4 py-2
                    text-sm
                    outline-none
                    cursor-pointer
                    hover:bg-gray-200
                    "
                >
                    <option value="Public">
                        Public
                    </option>

                    <option value="Network">
                        Network
                    </option>

                    <option value="Private">
                        Private
                    </option>

                </select>
            </div>}

            {/* LOCATION + DATE */}
            {(location || date) && (

                <div className="text-sm text-gray-500 mb-4 space-y-1">

                    {location && (
                        <div>{location}</div>
                    )}

                    {date instanceof Date && (
                        <div>
                            {date.toLocaleString()}
                        </div>
                    )}

                </div>
            )}

            <div className="border-t my-4"></div>

            {/* ACTION BAR */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">

                {/* LEFT */}
                <div className="flex flex-wrap items-center gap-4 text-gray-500">

                    {/* MEDIA */}
                    <button
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                        className="
                        cursor-pointer
                        flex items-center justify-center
                        h-10 w-10
                        rounded-full
                        hover:bg-gray-100
                        transition
                        "
                    >
                        <Image size={20} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        allow="image/*,video/*"
                        className="hidden"
                        onChange={handleFiles}
                    />

                    {/* EMOJI */}
                    <div
                        className="relative"
                        ref={emojiRef}
                    >

                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                setShowEmoji(
                                    (prev) => !prev
                                );
                            }}
                            className="
                            flex items-center justify-center
                            h-10 w-10
                            rounded-full
                            hover:bg-gray-100
                            transition
                            "
                        >
                            <Smile size={20} />
                        </button>

                        {showEmoji &&
                            createPortal(

                                <div
                                    className="
                                    fixed bottom-20
                                    left-1/2
                                    -translate-x-1/2
                                    sm:left-auto
                                    sm:right-8
                                    sm:translate-x-0
                                    z-[9999]
                                    "
                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }
                                >
                                    <EmojiPicker
                                        width={320}
                                        height={400}
                                        onEmojiClick={
                                            handleEmoji
                                        }
                                    />
                                </div>,

                                document.body
                            )}
                    </div>
                    {/* DATE */}
                    {isFuturePost &&
                        <DatePicker
                            selected={date}
                            onChange={handleDate}
                            showTimeSelect
                            timeIntervals={15}
                            minDate={new Date()}
                            customInput={<DateSelector />}
                            wrapperClassName="w-10 h-10 flex items-center justify-center"
                        />}
                    {/* LOCATION */}
                    <div
                        className="relative"
                        ref={locationRef}
                    >

                        <button
                            type="button"
                            onClick={(e) => {

                                e.stopPropagation();

                                setOpenLocation((prev) => !prev);

                                setShowEmoji(false);
                            }}
                            className="
        flex items-center gap-1
        h-10 px-3
        rounded-xl
        hover:bg-gray-100
        transition
        "
                        >

                            <MapPin size={20} />

                            <span className="text-sm cursor-pointer whitespace-nowrap">

                                {location || "Location"}

                            </span>

                            <ChevronDown
                                size={16}
                                className={`
            transition-transform
            ${openLocation ? "rotate-180" : ""}
            `}
                            />

                        </button>

                        {openLocation && (

                            <div
                                className="
            absolute
            bottom-14
            left-0

            sm:left-0

            z-50

            bg-white
            shadow-2xl
            border

            rounded-2xl
            p-4

            w-[300px]
            max-w-[90vw]

            space-y-3
            "
                                onClick={(e) => e.stopPropagation()}
                            >

                                {/* COUNTRY */}
                                <select
                                    value={country}
                                    onChange={(e) => {

                                        setCountry(e.target.value);

                                        setStateVal("");

                                        setCity("");
                                    }}
                                    className="
                w-full border
                rounded-xl
                p-2.5
                text-sm
                outline-none
                "
                                >

                                    <option value="">
                                        Country
                                    </option>

                                    {countries.map((c) => (

                                        <option
                                            key={c.isoCode}
                                            value={c.isoCode}
                                        >
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                {/* STATE */}
                                <select
                                    value={stateVal}
                                    onChange={(e) => {

                                        setStateVal(e.target.value);

                                        setCity("");
                                    }}
                                    disabled={!country}
                                    className="
                w-full border
                rounded-xl
                p-2.5
                text-sm
                outline-none
                disabled:bg-gray-100
                "
                                >

                                    <option value="">
                                        State
                                    </option>

                                    {states.map((s) => (

                                        <option
                                            key={s.isoCode}
                                            value={s.isoCode}
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                                </select>

                                {/* CITY */}
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    disabled={!stateVal}
                                    className="
                w-full border
                rounded-xl
                p-2.5
                text-sm
                outline-none
                disabled:bg-gray-100
                "
                                >

                                    <option value="">
                                        City
                                    </option>

                                    {cities.map((c) => (

                                        <option
                                            key={c.name}
                                            value={c.name}
                                        >
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={handleSetLocation}
                                    className="
                w-full
                btn-gradient
                text-white
                py-2.5
                cursor-pointer
                rounded-xl
                text-sm
                "
                                >
                                    Set Location
                                </button>

                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT */}
                <div className="flex items-center justify-end gap-3">

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                        text-gray-500
                        hover:text-black
                        text-sm
                        transition
                        "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={editRequest}
                        disabled={
                            text.length === 0 ||
                            loading
                        }
                        className={`
                        px-5 py-2
                        rounded-xl
                        text-sm
                        transition

                        ${(loading || text.length === 0)
                                ? "bg-gray-300 text-black"
                                : "btn-gradient text-white"}
                        `}
                    >

                        {loading
                            ? "Saving..."
                            : "Save"}

                    </button>

                </div>

            </div>

        </div>
    );
};

export default EditPost;