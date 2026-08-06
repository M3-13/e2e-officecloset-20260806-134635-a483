import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import styles from "./OutfitCreatorPage.module.css";

interface WardrobeItem {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string;
  created_at: string;
}

interface OutfitOut {
  id: number;
  name: string;
  items: WardrobeItem[];
  created_at: string;
}

const CATEGORY_ORDER = [
  "Oberteile",
  "Unterteile",
  "Kleider",
  "Schuhe",
  "Accessoires",
];

const CATEGORY_LABELS: Record<string, string> = {
  Oberteile: "Oberteile",
  Unterteile: "Unterteile",
  Kleider: "Kleider",
  Schuhe: "Schuhe",
  Accessoires: "Accessoires",
};

function groupByCategory(
  items: WardrobeItem[]
): Map<string, WardrobeItem[]> {
  const map = new Map<string, WardrobeItem[]>();
  for (const item of items) {
    const list = map.get(item.category) || [];
    list.push(item);
    map.set(item.category, list);
  }
  return map;
}

export default function OutfitCreatorPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [outfitName, setOutfitName] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadItems() {
      try {
        const items = await apiGet<WardrobeItem[]>(
          "/api/wardrobe/items",
          token
        );
        if (!cancelled) {
          setAllItems(items);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            navigate("/login");
            return;
          }
          setError(
            err instanceof Error ? err.message : "Fehler beim Laden der Garderobe"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadItems();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  const handleToggleItem = useCallback(
    (item: WardrobeItem) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        const isSelected = next.has(item.id);

        if (isSelected) {
          next.delete(item.id);
          return next;
        }

        if (item.category === "Kleider") {
          for (const otherId of next) {
            const other = allItems.find((i) => i.id === otherId);
            if (other && other.category === "Oberteile") {
              next.delete(otherId);
            }
          }
        } else if (item.category === "Oberteile") {
          for (const otherId of next) {
            const other = allItems.find((i) => i.id === otherId);
            if (other && other.category === "Kleider") {
              next.delete(otherId);
            }
          }
        }

        next.add(item.id);
        return next;
      });
    },
    [allItems]
  );

  const selectedItems = allItems.filter((i) => selectedIds.has(i.id));

  async function handleSave() {
    if (!outfitName.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await apiPost<OutfitOut>(
        "/api/outfits",
        { name: outfitName.trim(), item_ids: [...selectedIds] },
        token
      );
      navigate("/outfits");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login");
        return;
      }
      setSaveError(
        err instanceof Error ? err.message : "Fehler beim Speichern"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate("/outfits");
  }

  const grouped = groupByCategory(allItems);

  const orderedCategories = CATEGORY_ORDER.filter((cat) =>
    grouped.has(cat)
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.status}>Lade Garderobe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Outfit-Creator</h1>
      <div className={styles.layout}>
        <aside className={styles.aside}>
          <h2 className={styles.asideTitle}>Garderobe</h2>
          {allItems.length === 0 ? (
            <p className={styles.empty}>
              Deine Garderobe ist leer. Lege zuerst Kleidungsstücke an.
            </p>
          ) : (
            orderedCategories.map((cat) => (
              <div key={cat} className={styles.categorySection}>
                <h3 className={styles.categoryHeader}>
                  {CATEGORY_LABELS[cat] || cat}
                </h3>
                <div className={styles.thumbGrid}>
                  {grouped.get(cat)!.map((item) => {
                    const sel = selectedIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.thumb} ${sel ? styles.thumbSelected : ""}`}
                        onClick={() => handleToggleItem(item)}
                        title={item.name}
                      >
                        <img
                          src={item.thumbnail_url}
                          alt={item.name}
                          className={styles.thumbImg}
                        />
                        <span className={styles.thumbName}>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </aside>

        <section className={styles.stage}>
          <div className={styles.stageBody}>
            {selectedItems.length === 0 ? (
              <div className={styles.placeholder}>
                <p>
                  Wähle links Kleidungsstücke aus, um dein Outfit zusammenzustellen.
                </p>
              </div>
            ) : (
              <div className={styles.outfitGrid}>
                {selectedItems
                  .sort((a, b) => {
                    const ai = CATEGORY_ORDER.indexOf(a.category);
                    const bi = CATEGORY_ORDER.indexOf(b.category);
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                  })
                  .map((item) => (
                    <div key={item.id} className={styles.outfitItem}>
                      <img
                        src={item.thumbnail_url}
                        alt={item.name}
                        className={styles.outfitThumb}
                      />
                      <div className={styles.outfitMeta}>
                        <span className={styles.outfitName}>{item.name}</span>
                        <span className={styles.outfitCat}>
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {selectedItems.length > 0 && showNameInput && (
              <>
                <input
                  type="text"
                  className={styles.nameInput}
                  placeholder="Outfit-Name"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && outfitName.trim()) {
                      handleSave();
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSave}
                  disabled={saving || !outfitName.trim() || selectedItems.length === 0}
                >
                  {saving ? "Speichere..." : "Speichern"}
                </button>
              </>
            )}

            {selectedItems.length > 0 && !showNameInput && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setShowNameInput(true)}
              >
                Outfit speichern
              </button>
            )}

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancel}
            >
              Abbrechen
            </button>
          </div>

          {saveError && <p className={styles.error}>{saveError}</p>}
        </section>
      </div>
    </div>
  );
}
