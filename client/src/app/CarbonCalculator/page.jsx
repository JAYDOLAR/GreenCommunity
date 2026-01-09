"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Globe,
  Users,
  Car,
  Plane,
  Utensils,
  Beef,
  Fish,
  Milk,
  Home,
  PawPrint,
  Package,
  ArrowUp,
  ArrowDown,
  Calculator,
  Leaf,
  Check,
  User,
  Camera,
  Phone,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useFootprintLog } from "@/lib/useFootprintLog";

const CarbonCalculator = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    fullName: "",
    photo: "",
    country: "",
    state: "",
    mobile: "",
    householdSize: "",
    carMiles: "",
    carType: "",
    shortFlights: "",
    longFlights: "",
    diet: "",
    redMeat: "",
    otherProtein: "",
    dairy: "",
    homeSize: "",
    pets: "",
    publicTransit: "",
    furnishings: "",
    clothes: "",
    supplies: "",
  });
  // Restored supporting state & refs
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const sidebarRef = useRef(null);
  const countryScrollRef = useRef(null);
  const stateScrollRef = useRef(null);
  const leftSidebarScrollRef = useRef(null);
  const mainContentScrollRef = useRef(null);
  // Smoothly scroll the left sidebar without impacting main content scroll position
  const scrollSidebarTo = (elementId) => {
    const container = leftSidebarScrollRef.current;
    if (!container) return;
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
      const elOffset = el.offsetTop - container.offsetTop;
      const elHeight = el.offsetHeight;
      const containerHeight = container.clientHeight;
      const targetScroll = elOffset - (containerHeight - elHeight) / 2;
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    } catch (e) {
      // Fallback
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  const rightSidebarScrollRef = useRef(null);
  const router = useRouter();
  const { user, updateUser, isLoading } = useUser();
  const { createLog, loading: logLoading } = useFootprintLog();
  // Step visibility logic (diet-dependent)
  const isStepVisible = (id) => {
    const diet = data.diet;
    if (id === 9) {
      // Red meat question only relevant if user sometimes eats red meat
      return diet === "omnivore" || diet === "flexitarian"; // hide for vegan, vegetarian, pescatarian
    }
    if (id === 10) {
      // Other animal proteins (poultry/fish) not relevant for vegan or vegetarian
      return (
        diet === "omnivore" || diet === "flexitarian" || diet === "pescatarian"
      );
    }
    if (id === 11) {
      return diet !== "vegan"; // dairy hidden for vegan
    }
    return true;
  };

  const baseCategories = [
    { id: 1, icon: User, label: "Personal Info", completed: !!data.fullName },
    {
      id: 2,
      icon: Globe,
      label: "Country & State",
      completed: !!data.country && !!data.state,
    },
    { id: 3, icon: Phone, label: "Mobile Number", completed: !!data.mobile },
    { id: 4, icon: Users, label: "Household", completed: !!data.householdSize },
    { id: 5, icon: Car, label: "Cars", completed: !!data.carType },
    {
      id: 6,
      icon: Plane,
      label: "Short flights",
      completed: !!data.shortFlights,
    },
    {
      id: 7,
      icon: Plane,
      label: "Long flights",
      completed: !!data.longFlights,
    },
    { id: 8, icon: Utensils, label: "Diet", completed: !!data.diet },
    { id: 9, icon: Beef, label: "Red meat", completed: !!data.redMeat },
    {
      id: 10,
      icon: Fish,
      label: "Other protein",
      completed: !!data.otherProtein,
    },
    { id: 11, icon: Milk, label: "Dairy", completed: !!data.dairy },
    { id: 12, icon: Home, label: "Home size", completed: !!data.homeSize },
    { id: 13, icon: PawPrint, label: "Pets", completed: !!data.pets },
    { id: 14, icon: Package, label: "Lifestyle", completed: !!data.supplies },
  ];

  const categories = baseCategories.filter((c) => isStepVisible(c.id));

  const getNextVisible = (current) => {
    for (let i = current + 1; i <= 14; i++) {
      if (isStepVisible(i)) return i;
    }
    return current;
  };
  const getPrevVisible = (current) => {
    for (let i = current - 1; i >= 1; i--) {
      if (isStepVisible(i)) return i;
    }
    return current;
  };
  const lastVisibleStepId = (() => {
    for (let i = 14; i >= 1; i--) if (isStepVisible(i)) return i;
    return 14;
  })();

  // Auto-set dependent diet-related answers & adjust current step if hidden
  useEffect(() => {
    const diet = data.diet;
    if (!diet) return;
    setData((prev) => {
      const next = { ...prev };
      if (diet === "vegan") {
        next.redMeat = "never";
        next.otherProtein = "never";
        next.dairy = "none";
      } else if (diet === "vegetarian") {
        next.redMeat = "never";
        next.otherProtein = "never"; // exclude fish/poultry
        if (!next.dairy) next.dairy = "moderate";
      } else if (diet === "pescatarian") {
        next.redMeat = "never";
      } else if (diet === "flexitarian") {
        if (next.redMeat === "" || next.redMeat === "never")
          next.redMeat = "rarely";
      }
      return next;
    });
    setStep((cur) =>
      isStepVisible(cur)
        ? cur
        : getNextVisible(cur) !== cur
        ? getNextVisible(cur)
        : getPrevVisible(cur)
    );
  }, [data.diet]);

  // Persist location selection & update user context when country/state change
  useEffect(() => {
    try {
      const countryName = getCountryNameByCode(data.country);
      const stateName = getStateNameByCode(data.state);
      if (countryName || stateName) {
        const payload = {
          stateName: stateName || "",
          countryName: countryName || "",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedLocation", JSON.stringify(payload));
        }
        if (user && updateUser) {
          const updatedUser = {
            ...user,
            userInfo: {
              ...(user.userInfo || {}),
              location: {
                ...((user.userInfo && user.userInfo.location) || {}),
                city: stateName || "",
                country: countryName || "",
              },
            },
          };
          updateUser(updatedUser);
        }
      }
    } catch {}
  }, [data.country, data.state]);

  // Prefill full name from user context/localStorage after signup/login
  useEffect(() => {
    try {
      const cachedUserRaw =
        typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      let cachedName = "";
      if (cachedUserRaw) {
        try {
          const parsed = JSON.parse(cachedUserRaw);
          cachedName = parsed?.name || "";
        } catch {
          cachedName = "";
        }
      }
      const nameFromContext = user?.name || cachedName;
      if (nameFromContext && !data.fullName) {
        setData((prev) => ({ ...prev, fullName: nameFromContext }));
      }
    } catch {
      // no-op
    }
  }, [user]);

  // When user edits full name here, reflect it in user context for dashboard/header
  useEffect(() => {
    try {
      const newName = (data.fullName || "").trim();
      if (!newName) return;
      if (user && user.name !== newName && updateUser) {
        updateUser({ ...user, name: newName });
      } else if (!user && typeof window !== "undefined") {
        // Persist name for fallback if user is not yet in context
        const existing = localStorage.getItem("userData");
        let parsed = {};
        try {
          parsed = existing ? JSON.parse(existing) : {};
        } catch {}
        localStorage.setItem(
          "userData",
          JSON.stringify({ ...parsed, name: newName })
        );
      }
    } catch {}
  }, [data.fullName]);

  // Get country code for mobile number
  const getCountryCode = (countryCode) => {
    const countryCodes = {
      US: "+1",
      GB: "+44",
      DE: "+49",
      CA: "+1",
      AU: "+61",
      FR: "+33",
      IN: "+91",
      CN: "+86",
      JP: "+81",
      BR: "+55",
      IT: "+39",
      ES: "+34",
      NL: "+31",
      SE: "+46",
      NO: "+47",
      DK: "+45",
      FI: "+358",
      CH: "+41",
      AT: "+43",
      BE: "+32",
      IE: "+353",
      PT: "+351",
      GR: "+30",
      PL: "+48",
      CZ: "+420",
      HU: "+36",
      RO: "+40",
      BG: "+359",
      HR: "+385",
      SI: "+386",
      SK: "+421",
      LT: "+370",
      LV: "+371",
      EE: "+372",
      MT: "+356",
      CY: "+357",
      LU: "+352",
      IS: "+354",
      LI: "+423",
      MC: "+377",
      SM: "+378",
      VA: "+379",
      AD: "+376",
      AL: "+355",
      BA: "+387",
      ME: "+382",
      MK: "+389",
      RS: "+381",
      XK: "+383",
      TR: "+90",
      UA: "+380",
      BY: "+375",
      MD: "+373",
      GE: "+995",
      AM: "+374",
      AZ: "+994",
      KZ: "+7",
      KG: "+996",
      TJ: "+992",
      TM: "+993",
      UZ: "+998",
      MN: "+976",
      NP: "+977",
      BD: "+880",
      LK: "+94",
      MV: "+960",
      BT: "+975",
      PK: "+92",
      AF: "+93",
      IR: "+98",
      IQ: "+964",
      SY: "+963",
      LB: "+961",
      JO: "+962",
      IL: "+972",
      PS: "+970",
      SA: "+966",
      AE: "+971",
      QA: "+974",
      BH: "+973",
      KW: "+965",
      OM: "+968",
      YE: "+967",
      EG: "+20",
      SD: "+249",
      SS: "+211",
      LY: "+218",
      TN: "+216",
      DZ: "+213",
      MA: "+212",
      EH: "+212",
      TD: "+235",
      NE: "+227",
      ML: "+223",
      BF: "+226",
      BJ: "+229",
      NG: "+234",
      TG: "+228",
      GH: "+233",
      CI: "+225",
      CM: "+237",
      GQ: "+240",
      GA: "+241",
      CG: "+242",
      CD: "+243",
      AO: "+244",
      GW: "+245",
      GN: "+224",
      SL: "+232",
      LR: "+231",
      TG: "+228",
      BJ: "+229",
      BF: "+226",
      ML: "+223",
      NE: "+227",
      TD: "+235",
      MA: "+212",
      DZ: "+213",
      TN: "+216",
      LY: "+218",
      SS: "+211",
      SD: "+249",
      EG: "+20",
      YE: "+967",
      OM: "+968",
      KW: "+965",
      BH: "+973",
      QA: "+974",
      AE: "+971",
      SA: "+966",
      PS: "+970",
      IL: "+972",
      JO: "+962",
      LB: "+961",
      SY: "+963",
      IQ: "+964",
      IR: "+98",
      AF: "+93",
      PK: "+92",
      BT: "+975",
      MV: "+960",
      LK: "+94",
      BD: "+880",
      NP: "+977",
      MN: "+976",
      UZ: "+998",
      TM: "+993",
      TJ: "+992",
      KG: "+996",
      KZ: "+7",
      AZ: "+994",
      AM: "+374",
      GE: "+995",
      MD: "+373",
      BY: "+375",
      UA: "+380",
      TR: "+90",
      XK: "+383",
      RS: "+381",
      MK: "+389",
      ME: "+382",
      BA: "+387",
      AL: "+355",
      AD: "+376",
      VA: "+379",
      SM: "+378",
      MC: "+377",
      LI: "+423",
      IS: "+354",
      LU: "+352",
      CY: "+357",
      MT: "+356",
      EE: "+372",
      LV: "+371",
      LT: "+370",
      SK: "+421",
      SI: "+386",
      HR: "+385",
      BG: "+359",
      RO: "+40",
      HU: "+36",
      CZ: "+420",
      PL: "+48",
      GR: "+30",
      PT: "+351",
      IE: "+353",
      BE: "+32",
      AT: "+43",
      CH: "+41",
      FI: "+358",
      DK: "+45",
      NO: "+47",
      SE: "+46",
      NL: "+31",
      ES: "+34",
      IT: "+39",
      BR: "+55",
      JP: "+81",
      CN: "+86",
      IN: "+91",
      FR: "+33",
      AU: "+61",
      CA: "+1",
      DE: "+49",
      GB: "+44",
      US: "+1",
    };
    return countryCodes[countryCode] || "";
  };

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (data.country) {
      fetchStates(data.country);
      setStateSearch(""); // Reset state search when country changes
    } else {
      setStates([]);
    }
  }, [data.country]);

  // Filter countries based on search
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Filter states based on search
  const filteredStates = states.filter((state) =>
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.countrystatecity.in/v1/countries",
        {
          headers: {
            "X-CSCAPI-KEY":
              "MlU4TDJ0NDlYRU9ZSlptb0VkWHQ4cWxMRkMyVzYxeUdqMUVVMFM4RQ==",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sortedCountries = data
          .map((country) => ({
            name: country.name,
            code: country.iso2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      } else {
        console.error("Failed to fetch countries:", response.status);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryCode) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.countrystatecity.in/v1/countries/${countryCode}/states`,
        {
          headers: {
            "X-CSCAPI-KEY":
              "MlU4TDJ0NDlYRU9ZSlptb0VkWHQ4cWxMRkMyVzYxeUdqMUVVMFM4RQ==",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sortedStates = data
          .map((state) => ({
            name: state.name,
            code: state.iso2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setStates(sortedStates);
      } else {
        console.error("Failed to fetch states:", response.status);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setPhotoError("");

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setPhotoError("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        setData((prev) => ({ ...prev, photo: e.target.result }));
        setPhotoError("");
      } catch (error) {
        setPhotoError("Failed to load image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setPhotoError("Failed to read image file. Please try again.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    const fileInput = document.getElementById("photo-upload");
    if (fileInput) {
      fileInput.click();
    }
  };

  // Function to handle file input change with better error handling
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handlePhotoUpload(e);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  const calculateCarbonFootprint = () => {
    // Simple carbon footprint calculation based on user inputs
    let totalEmissions = 0;

    // Transportation emissions
    const carMiles = parseFloat(data.carMiles) || 0;
    const carTypeMultiplier =
      data.carType === "gas" ? 0.4 : data.carType === "hybrid" ? 0.25 : 0.1;
    totalEmissions += carMiles * carTypeMultiplier * 52; // Per year

    // Flight emissions
    const shortFlights = parseFloat(data.shortFlights) || 0;
    const longFlights = parseFloat(data.longFlights) || 0;
    totalEmissions += shortFlights * 1000 * 0.2; // kg CO2 per mile for short flights
    totalEmissions += longFlights * 2000 * 0.25; // kg CO2 per mile for long flights

    // Diet emissions (annual)
    // Updated diet mapping aligned with current options
    const dietMap = {
      omnivore: 1000,
      flexitarian: 850,
      pescatarian: 750,
      vegetarian: 650,
      vegan: 550,
    };
    const dietMultiplier = dietMap[data.diet] || 600;
    totalEmissions += dietMultiplier;

    // Housing emissions
    const householdSize = parseFloat(data.householdSize) || 1;
    const homeSize =
      data.homeSize === "large"
        ? 3000
        : data.homeSize === "medium"
        ? 2000
        : 1000;
    totalEmissions += (homeSize * 5.0) / householdSize; // Divided by household members

    return totalEmissions;
  };

  const handleNext = async () => {
    // If not authenticated, block advancing and surface prompt (defensive)
    if (!user) return;
    if (step < lastVisibleStepId) {
      const next = getNextVisible(step);
      if (next !== step) setStep(next);
      setTimeout(() => scrollSidebarTo(`sidebar-item-${next}`), 60);
      return;
    }
    // Final submission (create assessment log)
    try {
      setLoading(true);
      const totalEmissions = calculateCarbonFootprint(); // kg CO2e (annual)
      const logData = {
        activityType: "assessment-annual", // recognized server-side factor 1.0
        quantity: parseFloat(totalEmissions.toFixed(2)), // store actual emission as quantity
        selectedDate: new Date(),
        activity: "Annual Carbon Footprint Assessment",
        details: {
          assessment: true,
            totalEmissions,
            breakdown: {
              transportation: {
                carMiles: data.carMiles,
                carType: data.carType,
                shortFlights: data.shortFlights,
                longFlights: data.longFlights,
                publicTransit: data.publicTransit,
              },
              diet: {
                type: data.diet,
                redMeat: data.redMeat,
                otherProtein: data.otherProtein,
                dairy: data.dairy,
              },
              housing: {
                size: data.homeSize,
                householdSize: data.householdSize,
              },
              lifestyle: {
                pets: data.pets,
                furnishings: data.furnishings,
                clothes: data.clothes,
                supplies: data.supplies,
              },
            },
            userProfile: {
              fullName: data.fullName,
              country: data.country,
              state: data.state,
              mobile: data.mobile,
            },
            unit: "kg CO2e / year",
            category: "assessment",
            calculationMethod: "comprehensive-lifestyle-assessment",
        },
      };
      await createLog(logData);
      const trees = totalEmissions / 21;
      const cars = totalEmissions / (170 * 1000);
      const kwh = totalEmissions / 0.82;
      toast.success(
        `Annual footprint: ${totalEmissions.toFixed(1)} kg CO₂ • ≈ ${trees.toFixed(1)} trees • ${cars.toFixed(3)} cars • ${Math.round(kwh)} kWh`
      );
      router.push("/footprintlog");
    } catch (error) {
      console.error("Failed to save carbon footprint:", error);
      toast.error("Failed to save carbon footprint assessment");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      const prev = getPrevVisible(step);
      if (prev !== step) setStep(prev);
  setTimeout(() => scrollSidebarTo(`sidebar-item-${prev}`), 60);
    }
  };

  // Determine if the current (visible) step can advance (required fields only on first 3 steps)
  const isStepComplete = () => {
    const id = step; // step id corresponds to original numbering
    if (id === 1) return !!data.fullName;
    if (id === 2) return !!data.country && !!data.state;
    if (id === 3) return !!data.mobile;
    return true; // others optional
  };

  // (Removed duplicate static categories; using dynamic categories defined earlier)

  const getCurrentStepTitle = () => {
    switch (step) {
      case 1:
        return "Let's start with your personal information";
      case 2:
        return "Where are you located?";
      case 3:
        return "How can we reach you?";
      case 4:
        return "How many people live in your household?";
      case 5:
        return "Tell us about your car usage";
      case 6:
        return "How many short flights do you take per year?";
      case 7:
        return "How many long flights do you take per year?";
      case 8:
        return "What describes your diet?";
      case 9:
        return "How often do you eat red meat?";
      case 10:
        return "How often do you eat other proteins?";
      case 11:
        return "How much dairy do you consume?";
      case 12:
        return "What size is your home?";
      case 13:
        return "Do you have any pets?";
      case 14:
        return "Tell us about your lifestyle habits";
      default:
        return "";
    }
  };

  const getCurrentStepDescription = () => {
    switch (step) {
      case 1:
        return "Please provide your basic information to get started.";
      case 2:
        return "Select your country and state to help us calculate your carbon footprint accurately.";
      case 3:
        return "We'll use this to send you updates about your carbon footprint and environmental tips.";
      case 4:
        return "This helps us understand your household's shared carbon footprint.";
      case 5:
        return "Transportation is a major factor in carbon emissions.";
      case 6:
        return "Flights under 4 hours have different emission calculations.";
      case 7:
        return "Long-haul flights have higher per-mile emissions.";
      case 8:
        return "Your diet significantly impacts your carbon footprint.";
      case 9:
        return "Red meat has the highest carbon footprint of all foods.";
      case 10:
        return "Other proteins like chicken and fish have lower emissions.";
      case 11:
        return "Dairy products contribute to agricultural emissions.";
      case 12:
        return "Larger homes typically use more energy.";
      case 13:
        return "Pets, especially larger ones, have carbon footprints too.";
      case 14:
        return "Your consumption habits affect your overall footprint.";
      default:
        return "";
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Label className="text-base font-semibold text-gray-900">
          Profile Photo
        </Label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-green-200 shadow-lg">
            <AvatarImage src={data.photo} alt={data.fullName} />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="photo-upload"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-3 w-full sm:w-auto border-green-200 hover:border-green-300 hover:bg-green-50 h-12 px-4"
              disabled={isUploading}
              onClick={triggerFileInput}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  Upload Photo
                </>
              )}
            </Button>
            {data.photo && !isUploading && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Photo uploaded successfully
              </p>
            )}
          </div>
        </div>
        {photoError && (
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {photoError}
          </p>
        )}
      </div>

      {/* Full Name */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Label
          htmlFor="fullName"
          className="text-base font-semibold text-gray-900"
        >
          Full Name
        </Label>
        <Input
          id="fullName"
          value={data.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          placeholder="Enter your full name"
          className="mt-3 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 text-base"
        />
      </div>
    </div>
  );

  const renderCountryStep = () => (
    <div className="space-y-6">
      {/* Country Selection */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Label className="text-base font-semibold text-gray-900">Country</Label>
        <Select
          value={data.country}
          onValueChange={(value) => handleInputChange("country", value)}
        >
          <SelectTrigger className="h-12 mt-3 border-gray-300 focus:border-green-500 focus:ring-green-500">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-green-600" />
              <SelectValue
                placeholder={
                  loading ? "Loading countries..." : "Select your country"
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent
            onWheel={(e) => {
              if (countryScrollRef.current) {
                countryScrollRef.current.scrollTop += e.deltaY;
              }
            }}
          >
            {/* Search Input for Countries */}
            <div className="p-3">
              <Input
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="h-10 text-base"
              />
            </div>
            <div className="max-h-60 overflow-y-auto" ref={countryScrollRef}>
              {filteredCountries.map((country) => (
                <SelectItem
                  key={country.code}
                  value={country.code}
                  className="text-base"
                >
                  {country.name}
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* State Selection */}
      {data.country && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <Label className="text-base font-semibold text-gray-900">
            State/Province
          </Label>
          <Select
            value={data.state}
            onValueChange={(value) => handleInputChange("state", value)}
          >
            <SelectTrigger className="h-12 mt-3 border-gray-300 focus:border-green-500 focus:ring-green-500">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <SelectValue
                  placeholder={
                    loading ? "Loading states..." : "Select your state"
                  }
                />
              </div>
            </SelectTrigger>
            <SelectContent
              onWheel={(e) => {
                if (stateScrollRef.current) {
                  stateScrollRef.current.scrollTop += e.deltaY;
                }
              }}
            >
              {/* Search Input for States */}
              <div className="p-3">
                <Input
                  placeholder="Search states..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="h-10 text-base"
                />
              </div>
              <div className="max-h-60 overflow-y-auto" ref={stateScrollRef}>
                {filteredStates.map((state) => (
                  <SelectItem
                    key={state.code}
                    value={state.code}
                    className="text-base"
                  >
                    {state.name}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderMobileStep = () => {
    const countryCode = getCountryCode(data.country);

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <Label
            htmlFor="mobile"
            className="text-base font-semibold text-gray-900"
          >
            Mobile Number
          </Label>
          <div className="flex mt-3">
            {countryCode && (
              <div className="flex items-center px-4 bg-gray-100 border border-r-0 rounded-l-md text-base font-medium text-gray-700 h-12">
                {countryCode}
              </div>
            )}
            <Input
              id="mobile"
              value={data.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="Enter your mobile number"
              className={`${
                countryCode ? "rounded-l-none" : ""
              } border-gray-300 focus:border-green-500 focus:ring-green-500 h-12 text-base`}
            />
          </div>
          {countryCode && (
            <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Country code {countryCode} will be automatically added
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderMultipleChoice = (options, currentValue, field) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="grid gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={currentValue === option.value ? "default" : "outline"}
            className={`justify-start h-12 text-left font-normal text-base transition-all duration-200 ${
              currentValue === option.value
                ? "bg-green-600 hover:bg-green-700 border-green-600 text-white shadow-md"
                : "border-gray-300 hover:border-green-300 hover:bg-green-50 text-gray-700"
            }`}
            onClick={() => handleInputChange(field, option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderCountryStep();
      case 3:
        return renderMobileStep();
      case 4:
        return renderMultipleChoice(
          [
            { value: "1", label: "1 person" },
            { value: "2", label: "2 people" },
            { value: "3", label: "3 people" },
            { value: "4", label: "4 people" },
            { value: "5+", label: "5+ people" },
          ],
          data.householdSize,
          "householdSize"
        );
      case 5:
        return renderMultipleChoice(
          [
            { value: "none", label: "No car" },
            { value: "electric", label: "Electric vehicle" },
            { value: "hybrid", label: "Hybrid vehicle" },
            { value: "efficient", label: "Fuel efficient car" },
            { value: "average", label: "Average car" },
            { value: "large", label: "Large car/SUV" },
          ],
          data.carType,
          "carType"
        );
      case 6:
        return renderMultipleChoice(
          [
            { value: "0", label: "0 flights" },
            { value: "1-2", label: "1-2 flights" },
            { value: "3-5", label: "3-5 flights" },
            { value: "6-10", label: "6-10 flights" },
            { value: "10+", label: "10+ flights" },
          ],
          data.shortFlights,
          "shortFlights"
        );
      case 7:
        return renderMultipleChoice(
          [
            { value: "0", label: "0 flights" },
            { value: "1", label: "1 flight" },
            { value: "2-3", label: "2-3 flights" },
            { value: "4+", label: "4+ flights" },
          ],
          data.longFlights,
          "longFlights"
        );
      case 8:
        return renderMultipleChoice(
          [
            { value: "vegan", label: "Vegan" },
            { value: "vegetarian", label: "Vegetarian" },
            { value: "pescatarian", label: "Pescatarian" },
            { value: "flexitarian", label: "Flexitarian" },
            { value: "omnivore", label: "Omnivore" },
          ],
          data.diet,
          "diet"
        );
      case 9:
        return renderMultipleChoice(
          [
            { value: "never", label: "Never" },
            { value: "rarely", label: "Rarely (monthly)" },
            { value: "sometimes", label: "Sometimes (weekly)" },
            { value: "often", label: "Often (few times/week)" },
            { value: "daily", label: "Daily" },
          ],
          data.redMeat,
          "redMeat"
        );
      case 10:
        return renderMultipleChoice(
          [
            { value: "never", label: "Never" },
            { value: "rarely", label: "Rarely" },
            { value: "sometimes", label: "Sometimes" },
            { value: "often", label: "Often" },
            { value: "daily", label: "Daily" },
          ],
          data.otherProtein,
          "otherProtein"
        );
      case 11:
        return renderMultipleChoice(
          [
            { value: "none", label: "No dairy" },
            { value: "low", label: "Low consumption" },
            { value: "moderate", label: "Moderate consumption" },
            { value: "high", label: "High consumption" },
          ],
          data.dairy,
          "dairy"
        );
      case 12:
        return renderMultipleChoice(
          [
            { value: "studio", label: "Studio/1BR" },
            { value: "small", label: "Small (2BR)" },
            { value: "medium", label: "Medium (3BR)" },
            { value: "large", label: "Large (4BR+)" },
          ],
          data.homeSize,
          "homeSize"
        );
      case 13:
        return renderMultipleChoice(
          [
            { value: "0", label: "No pets" },
            { value: "1", label: "1 pet" },
            { value: "2", label: "2 pets" },
            { value: "3+", label: "3+ pets" },
          ],
          data.pets,
          "pets"
        );
      case 14:
        return renderMultipleChoice(
          [
            { value: "minimal", label: "Minimal lifestyle" },
            { value: "moderate", label: "Moderate consumption" },
            { value: "active", label: "Active consumer" },
            { value: "heavy", label: "Heavy consumer" },
          ],
          data.supplies,
          "supplies"
        );
      default:
        return null;
    }
  };

  // Unauthenticated view: show friendly gate instead of redirecting away
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Create an account to begin</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              The Carbon Calculator helps you build your sustainability profile. Please log in or create a free account to save your progress and footprint assessment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full h-11 border-gray-300 hover:border-green-400 hover:bg-green-50">
                Sign In
              </Button>
            </Link>
            <Link href="/Signup" className="flex-1">
              <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white">
                Create Account
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            You can explore other public areas first, then return here after registering.
          </p>
          <div>
            <Link href="/" className="text-xs font-medium text-green-700 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden">
      {/* Left Sidebar - Mobile: Full width, Tablet: Fixed width, Desktop: Fixed width */}
      <div
        className="w-full md:w-72 lg:w-72 bg-card border-b md:border-r md:border-b-0 border-border px-5 py-4 md:p-6 space-y-5 overflow-y-auto hide-scrollbar order-2 md:order-none md:h-screen md:sticky md:top-0"
        ref={leftSidebarScrollRef}
        onWheel={(e) => {
          if (leftSidebarScrollRef.current) {
            leftSidebarScrollRef.current.scrollTop += e.deltaY;
          }
        }}
      >
  <div className="flex items-center gap-4 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Calculator className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm md:text-base lg:text-base">
              Carbon Calculator
            </h1>
            <p className="text-sm text-muted-foreground">
              Calculate your footprint
            </p>
          </div>
        </div>

        {/* Mobile: Horizontal scroll, Tablet: Vertical list, Desktop: Vertical list */}
        <div
          className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0"
          ref={sidebarRef}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = category.id === step;
            const isCompleted = category.completed;

            return (
              <div
                key={category.id}
                id={`sidebar-item-${category.id}`}
                className={`flex items-center gap-3 md:gap-3 lg:gap-3 p-3 md:p-3 lg:p-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap md:whitespace-normal lg:whitespace-normal ${
                  isActive
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : isCompleted
                    ? "text-success bg-success/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                }`}
                onClick={() => {
                  setStep(category.id);
                  setTimeout(() => scrollSidebarTo(`sidebar-item-${category.id}`), 60);
                }}
              >
                <div
                  className={`w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center ${
                    isActive
                      ? "bg-green-200"
                      : isCompleted
                      ? "bg-success/20"
                      : "bg-muted"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-success" />
                  ) : (
                    <Icon
                      className={`h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 ${
                        isActive ? "text-green-700" : "text-muted-foreground"
                      }`}
                    />
                  )}
                </div>
                <span className="text-sm md:text-sm lg:text-sm font-medium">
                  {category.label}
                  {category.id <= 3 && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
  <div className="flex-1 flex flex-col overflow-hidden order-1 md:order-none">
        {/* Header */}
        <div className="border-b border-border px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1.5">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
                {getCurrentStepTitle()}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 max-w-prose">
                {getCurrentStepDescription()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="flex items-center gap-2 w-fit bg-white border border-green-200 text-green-700 whitespace-nowrap px-2.5 py-0.5 text-xs"
              >
                <Leaf className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap text-[11px] md:text-xs">
                  {categories.findIndex((c) => c.id === step) + 1} of{" "}
                  {categories.length}
                </span>
              </Badge>
              <p className="text-[10px] md:text-[11px] text-gray-500 hidden md:block">
                * Required steps
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 px-5 py-6 md:px-8 md:py-8 pb-40 content-area overflow-y-auto hide-scrollbar"
          ref={mainContentScrollRef}
        >
          <div className="max-w-3xl md:max-w-4xl mx-auto space-y-6">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 px-4 md:px-8 py-3 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 z-40 shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            {/* Inline progress indicator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{
                    width: `${
                      (categories.findIndex((c) => c.id === step) + 1) /
                        categories.length *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                Step {categories.findIndex((c) => c.id === step) + 1} / {categories.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className="px-4 h-10 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4 mr-2" /> Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={step === categories.length || step <= 3}
                  className="px-4 h-10 border-gray-300 hover:border-green-300 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Skip
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleNext}
                  disabled={!isStepComplete() || loading || logLoading}
                  className="px-6 h-10 bg-green-600 hover:bg-green-700 text-white shadow disabled:opacity-60 flex items-center"
                >
                  {loading || logLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {step === categories.length
                        ? "Calculating..."
                        : "Processing..."}
                    </>
                  ) : step === categories.length ? (
                    "Calculate & Save Footprint"
                  ) : (
                    <>
                      Continue <ArrowDown className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile, shown on tablet and desktop */}
      <div
        className="hidden xl:block w-80 2xl:w-96 bg-accent/5 border-l border-border p-6 overflow-y-auto"
        ref={rightSidebarScrollRef}
        onWheel={(e) => {
          if (rightSidebarScrollRef.current) {
            rightSidebarScrollRef.current.scrollTop += e.deltaY;
          }
        }}
      >
        <div className="space-y-6">

          <div className="bg-primary/5 p-5 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-primary mb-3 text-base">
              Why This Matters
            </h3>
            <p className="text-sm text-muted-foreground">
              Understanding your carbon footprint is the first step toward
              making meaningful changes for the environment.
            </p>
          </div>

          {/* Simple Carbon Footprint Display */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
            <h3 className="text-base font-medium text-gray-600 mb-3">
              Your carbon footprint
            </h3>
            <div className="text-5xl md:text-6xl font-bold text-gray-800">
              {(calculateCarbonFootprint() / 1000).toFixed(1)}
            </div>
            <p className="text-sm text-gray-500 mt-2">tons CO2e / year</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonCalculator;
