import { useState, useEffect, useCallback, type FormEvent, type DragEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPostMultipart, ApiError } from "../api/client";
import type { WardrobeItemOut, WardrobeCategory } from "../api/types";
import { WARDROBE_CATEGORIES } from "../api/types";
import styles from "./WardrobePage.module.css";

const API_CATEGORIES = ["Oberteil", "Unterteil", "Kleid", "Schuhe", "Accessoire"] as const;

function getThumbnailUrl(item: WardrobeItemOut): string {
  if (item.thumbnail_url) return item.thumbnail_url;
  return `/api/wardrobe/images/${item.id}/thumb`;
}

export default function WardrobePage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState<WardrobeItemOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory>("Alle");
  const [showModal, setShowModal] = useState(false);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Oberteil");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<WardrobeItemOut[]>("/api/wardrobe/items", token);
      setAllItems(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Fehler beim Laden der Garderobe.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems =
    activeCategory === "Alle"
      ? allItems
      : allItems.filter((item) => item.category === activeCategory);

  const categoryCounts: Record<string, number> = {};
  for (const item of allItems) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  }

  const resetForm = () => {
    setFormName("");
    setFormCategory("Oberteil");
    setFormDescription("");
    setFormImage(null);
    setFormImagePreview(null);
    setFormError(null);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setFormImage(null);
      setFormImagePreview(null);
      return;
    }

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFormError("Nur JPEG und PNG Dateien sind erlaubt.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Die Datei darf maximal 10 MB gross sein.");
      return;
    }

    setFormError(null);
    setFormImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Bitte gib einen Namen ein.");
      return;
    }
    if (!formImage) {
      setFormError("Bitte wähle ein Bild aus.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append("name", formName.trim());
      formData.append("category", formCategory);
      if (formDescription.trim()) {
        formData.append("description", formDescription.trim());
      }
      formData.append("image", formImage);

      await apiPostMultipart("/api/wardrobe/items", formData, token);
      resetForm();
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate("/login");
          return;
        }
        setFormError(err.message);
      } else {
        setFormError("Fehler beim Anlegen des Kleidungsstücks.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>&#128087;</div>
          <h2 className={styles.emptyHeading}>
            Melde dich an, um deine Garderobe zu sehen
          </h2>
          <p className={styles.emptyText}>
            Nur eingeloggte Benutzer können ihre Garderobe verwalten.
          </p>
          <Link to="/login" className={styles.submitButton}>
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>Lade Garderobe...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button
            onClick={fetchItems}
            className={styles.submitButton}
            type="button"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Garderobe</h1>
        <button
          className={styles.addButton}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          type="button"
        >
          + Neues Kleidungsstück
        </button>
      </div>

      <div className={styles.tabBar}>
        {WARDROBE_CATEGORIES.map((cat) => {
          const count =
            cat === "Alle"
              ? allItems.length
              : (categoryCounts[cat] || 0);
          return (
            <button
              key={cat}
              className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ""}`}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {cat}
              {count > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    background: "var(--color-burgundy)",
                    color: "var(--color-fg)",
                    borderRadius: "var(--radius-pill)",
                    padding: "2px 8px",
                    marginLeft: 6,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {allItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>&#128087;</div>
          <h2 className={styles.emptyHeading}>
            Deine Garderobe ist noch leer
          </h2>
          <p className={styles.emptyText}>
            Leg dein erstes Kleidungsstück an und fang an, umwerfende Outfits
            zusammenzustellen!
          </p>
          <button
            className={styles.submitButton}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            type="button"
          >
            Erstes Kleidungsstück anlegen
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>&#128269;</div>
          <h2 className={styles.emptyHeading}>
            Keine Kleidungsstücke in dieser Kategorie
          </h2>
          <p className={styles.emptyText}>
            Wähle eine andere Kategorie oder lege ein neues Kleidungsstück an.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              to={`/wardrobe/${item.id}`}
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                {item.thumbnail_url || item.image_url ? (
                  <img
                    src={getThumbnailUrl(item)}
                    alt={item.name}
                    className={styles.image}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>&#128247;</div>
                )}
              </div>
              <div className={styles.meta}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemCategory}>{item.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Neues Kleidungsstück</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="wardrobe-name">
                  Name *
                </label>
                <input
                  id="wardrobe-name"
                  className={styles.input}
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="z.B. Schwarze Abendrobe"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="wardrobe-category">
                  Kategorie *
                </label>
                <select
                  id="wardrobe-category"
                  className={styles.select}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {API_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="wardrobe-desc">
                  Beschreibung
                </label>
                <textarea
                  id="wardrobe-desc"
                  className={styles.textarea}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional: Material, Farbe, besondere Merkmale..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bild *</label>
                {formImagePreview ? (
                  <div className={styles.previewWrapper}>
                    <img
                      src={formImagePreview}
                      alt="Vorschau"
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      className={styles.removePreview}
                      onClick={() => handleFileChange(null)}
                      aria-label="Bild entfernen"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div
                    className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("wardrobe-file-input")?.click()
                    }
                  >
                    <div className={styles.dropZoneText}>
                      Bild hierher ziehen oder klicken zum Auswählen
                    </div>
                    <div className={styles.dropZoneHint}>
                      JPEG oder PNG, max. 10 MB
                    </div>
                  </div>
                )}
                <input
                  id="wardrobe-file-input"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
              </div>

              {formError && (
                <div className={styles.errorText}>{formError}</div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Speichere..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
