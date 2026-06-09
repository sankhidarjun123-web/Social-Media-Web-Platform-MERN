import { useState, useRef, useCallback } from "react";

const usePaginatedFetch = (
    fetchFunction,
    limit,
    custom = "",
    mode = "append",
    onError = () => {}
) => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noMore, setNoMore] = useState(false);
    const [error, setError] = useState("");

    const skipRef = useRef(0);
    const loadingRef = useRef(false);

    const fetchData = useCallback(async () => {

        if (loadingRef.current || noMore) return;

        loadingRef.current = true;
        setLoading(true);

        try {

            const response =
                await fetchFunction(
                    limit,
                    skipRef.current
                );

            const fetchedData =
                custom !== ""
                    ? response?.data?.[custom]
                    : response?.data;

            if (
                fetchedData &&
                fetchedData.length > 0
            ) {

                setData(prev => {

                    // PREPEND
                    if (mode === "prepend") {
                        return [
                            ...fetchedData,
                            ...prev
                        ];
                    }

                    // APPEND
                    return [
                        ...prev,
                        ...fetchedData
                    ];
                });
            }

            skipRef.current =
                response?.data?.nextSkip;

            setNoMore(
                response?.data?.noMore
            );

        } catch (err) {

            console.error(err);

            setError(
                err?.message ||
                "Something went wrong"
            );

            onError(err);

        } finally {

            loadingRef.current = false;
            setLoading(false);
        }

    }, [
        fetchFunction,
        limit,
        noMore,
        custom,
        mode
    ]);

    const resetData = () => {

        setData([]);
        skipRef.current = 0;
        setNoMore(false);
        setError("");
    };

    return {
        data,
        loading,
        noMore,
        error,
        fetchData,
        resetData,
        setData
    };
};

export default usePaginatedFetch;