import { useEffect, useRef } from "react";
import axios from "axios";


const SERVER = import.meta.env.VITE_SERVER_URL;

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const el = entry.target;

    if (entry.isIntersecting) {
      if (el.viewTimer) return; // prevent multiple timers

      el.viewTimer = setTimeout(() => {
        if (!el.dataset.viewed) {
          el.dataset.viewed = "true";

          const postId = el.dataset.postid;

          axios.post(`${SERVER}/userMedia/posts/${postId}/view`, {}, { withCredentials: true })
          .then(() => {
            console.log("Success viewing")
          }).catch(() => {
            el.dataset.viewed = "";
          });
        }
      }, 5000); // 5 seconds
    } else {
      clearTimeout(el.viewTimer);
      el.viewTimer = null;
    }
  });
}, { threshold: 0.6 });

const useViewTracker = (postId) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;

    if (el) {
      el.dataset.postid = postId;
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
        clearTimeout(el.viewTimer);
        el.viewTimer = null;
      }
    };
  }, [postId]);

  return ref;
};

export default useViewTracker;