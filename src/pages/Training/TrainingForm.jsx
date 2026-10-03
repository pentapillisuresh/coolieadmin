import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  X,
  Video,
  Play,
  Loader2,
  BookOpen,
  Calendar,
  Link as LinkIcon,
  Clock,
  Users,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";


// ============================================================
// API
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Content-Type"] = "application/json";

  return config;
});


// ============================================================
// CONSTANTS
// ============================================================

const PROFESSIONS = [
  "Coolie",
  "Loader",
  "Unloader",
  "Helper",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Mason",
  "Driver",
  "Cleaner",
  "Delivery Worker",
  "Construction Worker",
  "Other",
];

const LEVELS = [
  {
    value: "beginner",
    label: "Beginner",
  },
  {
    value: "intermediate",
    label: "Intermediate",
  },
  {
    value: "advanced",
    label: "Advanced",
  },
];


// ============================================================
// HELPERS
// ============================================================

const getTrainingData = (response) => {
  if (!response) return null;

  const data = response.data;

  if (data?.data) {
    return data.data;
  }

  return data;
};


const getVideos = (training) => {
  if (!training) return [];

  return (
    training.TrainingVideos ||
    training.trainingVideos ||
    training.videos ||
    []
  );
};


const parseProfessions = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};


const formatDateForInput = (date) => {
  if (!date) return "";

  try {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    const offset = d.getTimezoneOffset();

    const localDate = new Date(
      d.getTime() - offset * 60 * 1000
    );

    return localDate.toISOString().slice(0, 16);
  } catch (error) {
    return "";
  }
};


// ============================================================
// COMPONENT
// ============================================================

const TrainingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);


  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  // ============================================================
  // TRAINING FORM
  // ============================================================

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    applicableProfessions: [],
    level: "beginner",
    duration: "",
    isRequired: true,
    isActive: true,
    scheduledDate: "",
    meetingLink: "",
  });


  // ============================================================
  // VIDEOS
  // ============================================================

  const [videos, setVideos] = useState([]);

  const [showVideoForm, setShowVideoForm] = useState(false);

  const [editingVideoId, setEditingVideoId] = useState(null);

  const [videoSaving, setVideoSaving] = useState(false);

  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "",
    duration: "",
    sortOrder: 0,
    isFree: false,
  });


  // ============================================================
  // LOAD TRAINING FOR EDIT
  // ============================================================

  useEffect(() => {
    if (isEdit) {
      fetchTraining();
    }
  }, [id]);


  const fetchTraining = async () => {
    try {
      setLoading(true);

      console.log(
        "GET TRAINING:",
        `${API_BASE_URL}/training/${id}`
      );

      const response = await api.get(`/training/${id}`);

      console.log("TRAINING RESPONSE:", response.data);

      const training = getTrainingData(response);

      if (!training) {
        throw new Error("Training data not found");
      }

      setFormData({
        title: training.title || "",
        slug: training.slug || "",
        description: training.description || "",
        thumbnail: training.thumbnail || "",
        applicableProfessions: parseProfessions(
          training.applicableProfessions
        ),
        level: training.level || "beginner",
        duration:
          training.duration !== null &&
          training.duration !== undefined
            ? training.duration
            : "",
        isRequired:
          training.isRequired !== undefined
            ? Boolean(training.isRequired)
            : true,
        isActive:
          training.isActive !== undefined
            ? Boolean(training.isActive)
            : true,
        scheduledDate: formatDateForInput(
          training.scheduledDate
        ),
        meetingLink: training.meetingLink || "",
      });

      setVideos(getVideos(training));

    } catch (error) {
      console.error("FETCH TRAINING ERROR:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to load training"
      );
    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  // ============================================================
  // SLUG GENERATOR
  // ============================================================

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((prev) => ({
      ...prev,
      slug,
    }));
  };


  // ============================================================
  // PROFESSION SELECT
  // ============================================================

  const toggleProfession = (profession) => {
    setFormData((prev) => {
      const exists =
        prev.applicableProfessions.includes(profession);

      return {
        ...prev,
        applicableProfessions: exists
          ? prev.applicableProfessions.filter(
              (item) => item !== profession
            )
          : [
              ...prev.applicableProfessions,
              profession,
            ],
      };
    });
  };


  // ============================================================
  // SELECT ALL PROFESSIONS
  // ============================================================

  const selectAllProfessions = () => {
    setFormData((prev) => ({
      ...prev,
      applicableProfessions: [...PROFESSIONS],
    }));
  };


  // ============================================================
  // CLEAR PROFESSIONS
  // ============================================================

  const clearProfessions = () => {
    setFormData((prev) => ({
      ...prev,
      applicableProfessions: [],
    }));
  };


  // ============================================================
  // SAVE TRAINING
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Training title is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Training slug is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title.trim(),

        slug: formData.slug.trim(),

        description:
          formData.description.trim() || null,

        thumbnail:
          formData.thumbnail.trim() || null,

        applicableProfessions:
          formData.applicableProfessions,

        level: formData.level,

        duration:
          formData.duration === ""
            ? null
            : Number(formData.duration),

        isRequired: Boolean(formData.isRequired),

        isActive: Boolean(formData.isActive),

        scheduledDate:
          formData.scheduledDate || null,

        meetingLink:
          formData.meetingLink.trim() || null,
      };


      console.log(
        isEdit
          ? `PUT /training/${id}`
          : "POST /training"
      );

      console.log("PAYLOAD:", payload);


      let response;

      if (isEdit) {
        response = await api.put(
          `/training/${id}`,
          payload
        );
      } else {
        response = await api.post(
          "/training",
          payload
        );
      }


      console.log("SAVE RESPONSE:", response.data);


      toast.success(
        isEdit
          ? "Training updated successfully"
          : "Training created successfully"
      );


      // ========================================================
      // AFTER CREATE
      // ========================================================

      if (!isEdit) {
        const createdTraining =
          getTrainingData(response);

        if (createdTraining?.id) {
          navigate(
            `/training/${createdTraining.id}/edit`
          );
        } else {
          navigate("/training");
        }

        return;
      }


      // ========================================================
      // AFTER UPDATE
      // ========================================================

      await fetchTraining();

    } catch (error) {
      console.error("SAVE TRAINING ERROR:", error);

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to save training"
      );
    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // RESET VIDEO FORM
  // ============================================================

  const resetVideoForm = () => {
    setVideoForm({
      title: "",
      description: "",
      videoUrl: "",
      thumbnail: "",
      duration: "",
      sortOrder: 0,
      isFree: false,
    });

    setEditingVideoId(null);

    setShowVideoForm(false);
  };


  // ============================================================
  // VIDEO INPUT
  // ============================================================

  const handleVideoChange = (e) => {
    const { name, value, type, checked } = e.target;

    setVideoForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // ============================================================
  // ADD / UPDATE VIDEO
  // ============================================================

  const handleVideoSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      toast.error(
        "Please save the training before adding videos"
      );
      return;
    }

    if (!videoForm.title.trim()) {
      toast.error("Video title is required");
      return;
    }

    if (!videoForm.videoUrl.trim()) {
      toast.error("Video URL is required");
      return;
    }

    try {
      setVideoSaving(true);

      const payload = {
        title: videoForm.title.trim(),

        description:
          videoForm.description.trim() || null,

        videoUrl:
          videoForm.videoUrl.trim(),

        thumbnail:
          videoForm.thumbnail.trim() || null,

        duration:
          videoForm.duration === ""
            ? null
            : Number(videoForm.duration),

        sortOrder:
          videoForm.sortOrder === ""
            ? 0
            : Number(videoForm.sortOrder),

        isFree: Boolean(videoForm.isFree),
      };


      console.log(
        editingVideoId
          ? `PUT /training/videos/${editingVideoId}`
          : `POST /training/${id}/videos`
      );

      console.log("VIDEO PAYLOAD:", payload);


      if (editingVideoId) {

        await api.put(
          `/training/videos/${editingVideoId}`,
          payload
        );

        toast.success(
          "Training video updated successfully"
        );

      } else {

        await api.post(
          `/training/${id}/videos`,
          payload
        );

        toast.success(
          "Training video added successfully"
        );
      }


      resetVideoForm();

      await fetchTraining();

    } catch (error) {
      console.error(
        "VIDEO SAVE ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to save video"
      );

    } finally {
      setVideoSaving(false);
    }
  };


  // ============================================================
  // EDIT VIDEO
  // ============================================================

  const handleEditVideo = (video) => {
    setEditingVideoId(video.id);

    setVideoForm({
      title: video.title || "",

      description:
        video.description || "",

      videoUrl:
        video.videoUrl || "",

      thumbnail:
        video.thumbnail || "",

      duration:
        video.duration !== null &&
        video.duration !== undefined
          ? video.duration
          : "",

      sortOrder:
        video.sortOrder !== null &&
        video.sortOrder !== undefined
          ? video.sortOrder
          : 0,

      isFree:
        Boolean(video.isFree),
    });

    setShowVideoForm(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };


  // ============================================================
  // DELETE VIDEO
  // ============================================================

  const handleDeleteVideo = async (videoId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/training/videos/${videoId}`
      );

      toast.success(
        "Training video deleted successfully"
      );

      await fetchTraining();

    } catch (error) {
      console.error(
        "DELETE VIDEO ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete video"
      );
    }
  };


  // ============================================================
  // DELETE TRAINING
  // ============================================================

  const handleDeleteTraining = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this training?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/training/${id}`
      );

      toast.success(
        "Training deleted successfully"
      );

      navigate("/training");

    } catch (error) {
      console.error(
        "DELETE TRAINING ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete training"
      );
    }
  };


  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={40}
            className="animate-spin text-[#FD9A00]"
          />

          <p className="text-gray-500">
            Loading training...
          </p>
        </div>
      </div>
    );
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f7f7f8] p-4 md:p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/training")}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
            >
              <ArrowLeft size={19} />
            </button>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {isEdit
                  ? "Edit Training"
                  : "Create Training"}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {isEdit
                  ? "Update training information and videos"
                  : "Create a new worker training program"}
              </p>

            </div>

          </div>


          {isEdit && (
            <button
              type="button"
              onClick={handleDeleteTraining}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              <Trash2 size={17} />
              Delete Training
            </button>
          )}

        </div>


        {/* ====================================================
            TRAINING FORM
        ==================================================== */}

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ==================================================
                MAIN INFORMATION
            ================================================== */}

            <div className="lg:col-span-2">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

                <div className="flex items-center gap-3 mb-6">

                  <div className="w-11 h-11 rounded-xl bg-[#FD9A00]/10 flex items-center justify-center">
                    <BookOpen
                      size={22}
                      className="text-[#FD9A00]"
                    />
                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-gray-900">
                      Training Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      Basic training details
                    </p>

                  </div>

                </div>


                {/* TITLE */}

                <div className="mb-5">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Example: Workplace Safety Basics"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                    required
                  />

                </div>


                {/* SLUG */}

                <div className="mb-5">

                  <div className="flex items-center justify-between mb-2">

                    <label className="block text-sm font-medium text-gray-700">
                      Slug *
                    </label>

                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-xs font-medium text-[#FD9A00] hover:underline"
                    >
                      Generate from title
                    </button>

                  </div>

                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="workplace-safety-basics"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                    required
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="mb-5">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe what workers will learn..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00] resize-none"
                  />

                </div>


                {/* THUMBNAIL */}

                <div className="mb-5">

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon size={16} />
                    Thumbnail URL
                  </label>

                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="https://example.com/training-thumbnail.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                  />

                </div>


                {/* LEVEL + DURATION */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>

                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                    >

                      {LEVELS.map((level) => (
                        <option
                          key={level.value}
                          value={level.value}
                        >
                          {level.label}
                        </option>
                      ))}

                    </select>

                  </div>


                  <div>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Clock size={16} />
                      Duration (minutes)
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="30"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                    />

                  </div>

                </div>


                {/* SCHEDULED DATE */}

                <div className="mb-5">

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} />
                    Scheduled Date
                  </label>

                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                  />

                </div>


                {/* MEETING LINK */}

                <div>

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon size={16} />
                    Meeting Link
                  </label>

                  <input
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                  />

                </div>

              </div>


              {/* ==================================================
                  PROFESSIONS
              ================================================== */}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-[#FD9A00]/10 flex items-center justify-center">
                      <Users
                        size={22}
                        className="text-[#FD9A00]"
                      />
                    </div>

                    <div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        Applicable Professions
                      </h2>

                      <p className="text-sm text-gray-500">
                        Select workers who should see this training
                      </p>

                    </div>

                  </div>


                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={selectAllProfessions}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearProfessions}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      Clear
                    </button>

                  </div>

                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                  {PROFESSIONS.map((profession) => {

                    const selected =
                      formData.applicableProfessions.includes(
                        profession
                      );

                    return (
                      <button
                        key={profession}
                        type="button"
                        onClick={() =>
                          toggleProfession(
                            profession
                          )
                        }
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition ${
                          selected
                            ? "border-[#FD9A00] bg-[#FD9A00]/10 text-gray-900"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >

                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            selected
                              ? "bg-[#FD9A00] border-[#FD9A00]"
                              : "border-gray-300"
                          }`}
                        >

                          {selected && (
                            <CheckCircle
                              size={14}
                              className="text-white"
                            />
                          )}

                        </span>

                        <span className="text-sm">
                          {profession}
                        </span>

                      </button>
                    );

                  })}

                </div>

              </div>

            </div>


            {/* ==================================================
                RIGHT SIDEBAR
            ================================================== */}

            <div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">

                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                  Settings
                </h2>


                {/* REQUIRED */}

                <label className="flex items-start gap-3 cursor-pointer mb-5">

                  <input
                    type="checkbox"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-[#FD9A00]"
                  />

                  <div>

                    <p className="font-medium text-gray-800">
                      Required Training
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Workers must complete this training.
                    </p>

                  </div>

                </label>


                {/* ACTIVE */}

                <label className="flex items-start gap-3 cursor-pointer mb-6">

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-[#FD9A00]"
                  />

                  <div>

                    <p className="font-medium text-gray-800">
                      Active Training
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Active trainings are available to workers.
                    </p>

                  </div>

                </label>


                {/* SELECTED PROFESSIONS */}

                <div className="border-t border-gray-100 pt-5">

                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">
                    Selected Professions
                  </p>

                  {formData.applicableProfessions.length ===
                  0 ? (
                    <p className="text-sm text-gray-400">
                      No professions selected
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">

                      {formData.applicableProfessions.map(
                        (profession) => (
                          <span
                            key={profession}
                            className="px-2.5 py-1 rounded-lg bg-[#FD9A00]/10 text-[#9a5c00] text-xs font-medium"
                          >
                            {profession}
                          </span>
                        )
                      )}

                    </div>
                  )}

                </div>


                {/* SAVE */}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#FD9A00] text-white font-semibold hover:bg-[#e58a00] disabled:opacity-60 disabled:cursor-not-allowed transition"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />

                      {isEdit
                        ? "Update Training"
                        : "Create Training"}
                    </>
                  )}

                </button>


                <button
                  type="button"
                  onClick={() => navigate("/training")}
                  className="w-full mt-3 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </form>


        {/* ======================================================
            VIDEOS SECTION
        ====================================================== */}

        {isEdit && (

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">

            {/* VIDEO HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-[#FD9A00]/10 flex items-center justify-center">

                  <Video
                    size={22}
                    className="text-[#FD9A00]"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Training Videos
                  </h2>

                  <p className="text-sm text-gray-500">
                    Add video lessons to this training
                  </p>

                </div>

              </div>


              {!showVideoForm && (

                <button
                  type="button"
                  onClick={() => {
                    resetVideoForm();
                    setShowVideoForm(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FD9A00] text-white font-medium hover:bg-[#e58a00] transition"
                >

                  <Plus size={18} />

                  Add Video

                </button>

              )}

            </div>


            {/* ==================================================
                VIDEO FORM
            ================================================== */}

            {showVideoForm && (

              <div className="border border-gray-200 rounded-2xl p-5 mb-6 bg-gray-50">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h3 className="font-semibold text-gray-900">

                      {editingVideoId
                        ? "Edit Video"
                        : "Add New Video"}

                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Add the video URL and lesson information
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={resetVideoForm}
                    className="w-9 h-9 rounded-lg hover:bg-white flex items-center justify-center text-gray-500"
                  >

                    <X size={18} />

                  </button>

                </div>


                <form onSubmit={handleVideoSubmit}>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* VIDEO TITLE */}

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Title *
                      </label>

                      <input
                        type="text"
                        name="title"
                        value={videoForm.title}
                        onChange={handleVideoChange}
                        placeholder="Example: Safety Introduction"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                        required
                      />

                    </div>


                    {/* VIDEO URL */}

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL *
                      </label>

                      <input
                        type="url"
                        name="videoUrl"
                        value={videoForm.videoUrl}
                        onChange={handleVideoChange}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                        required
                      />

                    </div>


                    {/* THUMBNAIL */}

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail URL
                      </label>

                      <input
                        type="url"
                        name="thumbnail"
                        value={videoForm.thumbnail}
                        onChange={handleVideoChange}
                        placeholder="https://example.com/thumb.jpg"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                      />

                    </div>


                    {/* DURATION */}

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (seconds)
                      </label>

                      <input
                        type="number"
                        min="0"
                        name="duration"
                        value={videoForm.duration}
                        onChange={handleVideoChange}
                        placeholder="300"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                      />

                    </div>


                    {/* SORT ORDER */}

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>

                      <input
                        type="number"
                        min="0"
                        name="sortOrder"
                        value={videoForm.sortOrder}
                        onChange={handleVideoChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00]"
                      />

                    </div>


                    {/* FREE */}

                    <div className="flex items-center">

                      <label className="flex items-center gap-3 cursor-pointer">

                        <input
                          type="checkbox"
                          name="isFree"
                          checked={videoForm.isFree}
                          onChange={handleVideoChange}
                          className="w-4 h-4 accent-[#FD9A00]"
                        />

                        <span className="text-sm font-medium text-gray-700">
                          Free Video
                        </span>

                      </label>

                    </div>

                  </div>


                  {/* DESCRIPTION */}

                  <div className="mt-5">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Description
                    </label>

                    <textarea
                      name="description"
                      value={videoForm.description}
                      onChange={handleVideoChange}
                      rows={3}
                      placeholder="Describe this video lesson..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD9A00]/30 focus:border-[#FD9A00] resize-none"
                    />

                  </div>


                  {/* VIDEO BUTTONS */}

                  <div className="flex justify-end gap-3 mt-5">

                    <button
                      type="button"
                      onClick={resetVideoForm}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={videoSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FD9A00] text-white font-semibold hover:bg-[#e58a00] disabled:opacity-60"
                    >

                      {videoSaving ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />

                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={17} />

                          {editingVideoId
                            ? "Update Video"
                            : "Add Video"}
                        </>
                      )}

                    </button>

                  </div>

                </form>

              </div>

            )}


            {/* ==================================================
                VIDEO LIST
            ================================================== */}

            {videos.length === 0 ? (

              <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center">

                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">

                  <Video
                    size={25}
                    className="text-gray-400"
                  />

                </div>

                <h3 className="font-semibold text-gray-700">
                  No videos added
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Add your first training video above.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {videos
                  .sort(
                    (a, b) =>
                      (a.sortOrder || 0) -
                      (b.sortOrder || 0)
                  )
                  .map((video, index) => (

                    <div
                      key={video.id || index}
                      className="border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition"
                    >

                      <div className="flex flex-col md:flex-row gap-4">

                        {/* THUMBNAIL */}

                        <div className="w-full md:w-48 h-28 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">

                          {video.thumbnail ? (

                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center">

                              <Video
                                size={30}
                                className="text-gray-400"
                              />

                            </div>

                          )}

                        </div>


                        {/* INFO */}

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-wrap items-center gap-2 mb-2">

                            <span className="px-2 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600">
                              Video {index + 1}
                            </span>

                            {video.isFree && (

                              <span className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-semibold">
                                Free
                              </span>

                            )}

                          </div>


                          <h3 className="font-semibold text-gray-900 text-lg">
                            {video.title ||
                              "Untitled Video"}
                          </h3>


                          {video.description && (

                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {video.description}
                            </p>

                          )}


                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">

                            {video.duration !== null &&
                              video.duration !==
                                undefined && (

                                <span className="flex items-center gap-1">

                                  <Clock size={14} />

                                  {video.duration}s

                                </span>

                              )}


                            <a
                              href={
                                video.videoUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[#FD9A00] hover:underline"
                            >

                              <Play size={14} />

                              Open Video

                            </a>

                          </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="flex md:flex-col gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditVideo(
                                video
                              )
                            }
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                          >

                            <Edit size={16} />

                            <span className="md:hidden">
                              Edit
                            </span>

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteVideo(
                                video.id
                              )
                            }
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm"
                          >

                            <Trash2 size={16} />

                            <span className="md:hidden">
                              Delete
                            </span>

                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default TrainingForm;