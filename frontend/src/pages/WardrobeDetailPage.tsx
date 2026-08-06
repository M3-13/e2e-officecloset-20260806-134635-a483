import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPutMultipart, apiDelete, ApiError } from "../api/client";
import type { WardrobeItemOut } from "../api/types";
import styles from "./WardrobeDetailPage.module.css";

const API_CATEGORIES = ["Oberteil", "Unterteil", "Kleid", "Schuhe", "Accessoire"] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function WardrobeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<WardrobeItemOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Oberteil");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItem = async () => {
    if (!isAuthenticated || !id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<WardrobeItemOut>(
        `/api/wardrobe/items/${id}`,
        token
      );
      setItem(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate("/login");
          return;
        }
        if (err.status === 404) {
          setError("Kleidungsstück nicht gefunden.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Fehler beim Laden des Kleidungsstücks.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id, isAuthenticated]);

  const startEditing = () => {
    if (!item) return;
    setEditName(item.name);
    setEditCategory(item.category);
    setEditDescription(item.description || "");
    setEditImage(null);
    setEditImagePreview(null);
    setEditError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError(null);
  };

  const handleEditImageChange = (file: File | null) => {
    if (!file) {
      setEditImage(null);
      setEditImagePreview(null);
      return;
    }
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setEditError("Nur JPEG und PNG Dateien sind erlaubt.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setEditError("Die Datei darf maximal 10 MB gross sein.");
      return;
    }
    setEditError(null);
    setEditImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError("Bitte gib einen Namen ein.");
      return;
    }
    setSaving(true);
    setEditError(null);

    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("category", editCategory);
      if (editDescription.trim()) {
        formData.append("description", editDescription.trim());
      } else {
        formData.append("description", "");
      }
      if (editImage) {
        formData.append("image", editImage);
      }

      const updated = await apiPutMultipart<WardrobeItemOut>(
        `/api/wardrobe/items/${id}`,
        formData,
        token
      );
      setItem(updated);
      setEditing(false);
      setEditError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate("/login");
          return;
        }
        setEditError(err.message);
      } else {
        setEditError("Fehler beim Speichern.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/api/wardrobe/items/${id}`, token);
      navigate("/wardrobe");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          navigate("/login");
          return;
        }
        setError(err.message);
      } else {
        setError("Fehler beim Löschen.");
      }
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>Bitte melde dich an, um Details anzusehen.</p>
          <Link to="/login" className={styles.errorBackLink}>
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>Lade Kleidungsstück...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error || "Kleidungsstück nicht gefunden."}</p>
          <Link to="/wardrobe" className={styles.errorBackLink}>
            Zurück zur Garderobe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/wardrobe" className={styles.backLink}>
        &larr; Zurück zur Garderobe
      </Link>

      {editing ? (
        <form onSubmit={handleEditSubmit} className={styles.inlineForm}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="edit-name">
              Name *
            </label>
            <input
              id="edit-name"
              className={styles.input}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="edit-category">
              Kategorie *
            </label>
            <select
              id="edit-category"
              className={styles.select}
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              {API_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="edit-desc">
              Beschreibung
            </label>
            <textarea
              id="edit-desc"
              className={styles.textarea}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Neues Bild (optional)</label>
            {editImagePreview ? (
              <div>
                <div className={styles.editPreview}>
                  <img
                    src={editImagePreview}
                    alt="Neues Bild"
                    className={styles.editPreviewImage}
                  />
                </div>
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => handleEditImageChange(null)}
                >
                  Bild entfernen
                </button>
              </div>
            ) : (
              <div
                className={styles.imageUpload}
                onClick={() =>
                  document.getElementById("edit-file-input")?.click()
                }
              >
                <div>Klicken zum Auswählen eines neuen Bildes</div>
                <div className={styles.imageUploadHint}>
                  JPEG oder PNG, max. 10 MB
                </div>
              </div>
            )}
            <input
              id="edit-file-input"
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) =>
                handleEditImageChange(e.target.files?.[0] || null)
              }
              style={{ display: "none" }}
            />
          </div>

          {editError && <div className={styles.errorText}>{editError}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={cancelEditing}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving}
            >
              {saving ? "Speichere..." : "Speichern"}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.content}>
          <div className={styles.imageSection}>
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className={styles.fullImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>&#128247;</div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.title}>{item.name}</h1>
            <span className={styles.categoryBadge}>{item.category}</span>

            <hr className={styles.divider} />

            {item.description && (
              <div className={styles.description}>{item.description}</div>
            )}

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Erstellt am</span>
              <span className={styles.metaValue}>
                {formatDate(item.created_at)}
              </span>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.editButton}
                onClick={startEditing}
                type="button"
              >
                Bearbeiten
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => setShowDeleteConfirm(true)}
                type="button"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className={styles.confirmOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <div className={styles.confirmDialog}>
            <h2 className={styles.confirmTitle}>Löschen bestätigen</h2>
            <p className={styles.confirmText}>
              Möchtest du &quot;{item.name}&quot; wirklich löschen? Diese Aktion
              kann nicht rückgängig gemacht werden.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
                disabled={deleting}
              >
                Abbrechen
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDelete}
                type="button"
                disabled={deleting}
              >
                {deleting ? "Lösche..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
