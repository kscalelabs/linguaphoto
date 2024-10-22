import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import throttle from "lodash/throttle";

type Theme = "light" | "dark";

const THEME_KEY = "__THEME";

interface ThemeColors {
  backgroundColor: string;
  color: string;
}

const COLORS: { [key in Theme]: ThemeColors } = {
  light: {
    backgroundColor: "#ffffff",
    color: "#201a42",
  },
  dark: {
    backgroundColor: "#ffffff",
    color: "#f5f2ef",
  },
};

const getThemeFromLocalStorage = (): Theme => {
  // const theme = localStorage.getItem(THEME_KEY); //now light mode disable
  const theme = "dark";
  if (theme === null) {
    return "dark";
  }
  return theme as Theme;
};

const setThemeWithLocalStorage = (theme: Theme) => {
  localStorage.setItem(THEME_KEY, theme);
};

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const { children } = props;

  const [theme, setTheme] = useState<Theme>(getThemeFromLocalStorage());

  const setThemeWrapper = (theme: Theme) => {
    setTheme(theme);
    setThemeWithLocalStorage(theme);
  };

  const scrollSpeed = 200; // Increase this value to make scrolling faster

  // useEffect(() => {
  //   const handleWheel = (event: WheelEvent) => {
  //     event.preventDefault(); // Prevent default scroll behavior
  //     window.scrollBy({
  //       top: event.deltaY * scrollSpeed, // Multiply the scroll amount
  //       left: 0,
  //       behavior: "smooth", // Use smooth scrolling
  //     });
  //   };

  //   window.addEventListener("wheel", handleWheel, { passive: false });

  //   // Clean up the event listener on component unmount
  //   return () => {
  //     window.removeEventListener("wheel", handleWheel);
  //   };
  // }, []); // Empty dependency array ensures this runs only on mount and unmount

const handleKey = throttle((event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowUp":
      window.scrollBy({
        top: -600,
        left: 0,
        behavior: "smooth",
      });
      break;
    case "ArrowDown":
      window.scrollBy({
        top: 600,
        left: 0,
        behavior: "smooth",
      });
      break;
  }
}, 300);

useEffect(() => {
  const throttledHandleKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault(); // Prevent the default behavior for arrow keys.
      handleKey(event);
    }
  }; // Adjust the throttle delay (200ms here) as needed.

  window.addEventListener("keydown", throttledHandleKey);
  return () => {
    window.removeEventListener("keydown", throttledHandleKey);
    handleKey.cancel(); // Clean up the throttling
  };
}, []);


  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
    document.body.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("light", theme === "light");
    document.body.style.backgroundColor = COLORS[theme].backgroundColor;
    document.body.style.color = COLORS[theme].color;
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: setThemeWrapper, colors: COLORS[theme] }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
