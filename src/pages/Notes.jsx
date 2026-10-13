
import { useEffect, useState } from "react";
import {
  NotebookPen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Pin,
} from "lucide-react";

const STORAGE_KEY = "taskflow-notes";

const initialNotes = [
  {
    id: 1,
    title: "Project Planning",
    content:
      "Finalize project requirements, assign responsibilities, and prepare the development timeline.",
    category: "Work",
    pinned: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Meeting Notes",
    content:
      "Discuss project progress, review pending tasks, and identify any blockers.",
    category: "Meeting",
    pinned: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Ideas and Improvements",
    content:
      "Improve dashboard responsiveness and make task management easier for team members.",
    category: "Ideas",
    pinned: false,
    updatedAt: new Date().toISOString(),
  },
];

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialNotes;
    }
  } catch (error) {
    console.error("Unable to load notes:", error);
  }

  return initialNotes;
}

const emptyForm = {
  title: "",
  content: "",
  category: "Work",
};

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Unable to save notes:", error);
    }
  }, [notes]);

  const categories = [
    "All",
    ...new Set(notes.map((note) => note.category || "Other")),
  ];

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch = [note.title, note.content, note.category]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || note.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(note) {
    setEditingId(note.id);
    setForm({
      title: note.title || "",
      content: note.content || "",
      category: note.category || "Work",
    });
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const now = new Date().toISOString();

    const noteData = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      updatedAt: now,
    };

    if (editingId !== null) {
      setNotes((current) =>
        current.map((note) =>
          note.id === editingId ? { ...note, ...noteData } : note
        )
      );
    } else {
      setNotes((current) => [
        ...current,
        {
          ...noteData,
          id: Date.now(),
          pinned: false,
        },
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function deleteNote(id) {
    const note = notes.find((item) => item.id === id);

    if (
      note &&
      window.confirm(`Are you sure you want to delete "${note.title}"?`)
    ) {
      setNotes((current) => current.filter((item) => item.id !== id));
    }
  }

  function togglePin(id) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  }

  function formatDate(value) {
    if (!value) return "Recently updated";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Recently updated";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div>
          <h1>Notes</h1>
          <p>Keep your ideas, meeting notes, and important information organized.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add note
        </button>
      </div>

      <div className="notes-summary">
        <div className="notes-summary-icon">
          <NotebookPen size={24} />
        </div>
        <div>
          <span>Total notes</span>
          <strong>{notes.length}</strong>
        </div>
      </div>

      <div className="notes-toolbar">
        <div className="notes-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search notes"
          />
        </div>

        <select
          className="notes-category-filter"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All categories" : category}
            </option>
          ))}
        </select>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="notes-empty">
          <NotebookPen size={40} />
          <h3>No notes found</h3>
          <p>Try another search or create a new note.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <article className="note-card" key={note.id}>
              <div className="note-card-top">
                <span className="note-category">{note.category}</span>

                <div className="note-actions">
                  <button
                    type="button"
                    className={`note-icon-button ${note.pinned ? "pinned" : ""}`}
                    title={note.pinned ? "Unpin note" : "Pin note"}
                    aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    onClick={() => togglePin(note.id)}
                  >
                    <Pin size={16} />
                  </button>

                  <button
                    type="button"
                    className="note-icon-button"
                    title="Edit note"
                    aria-label={`Edit ${note.title}`}
                    onClick={() => openEditForm(note)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="note-icon-button danger"
                    title="Delete note"
                    aria-label={`Delete ${note.title}`}
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{note.title}</h3>
              <p className="note-content">{note.content}</p>

              <div className="note-card-footer">
                {note.pinned && <span className="note-pinned-label">Pinned</span>}
                <span>Updated {formatDate(note.updatedAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="note-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="note-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-modal-title"
          >
            <div className="note-modal-header">
              <div>
                <h2 id="note-modal-title">
                  {editingId !== null ? "Edit note" : "Create note"}
                </h2>
                <p>Write down something important.</p>
              </div>

              <button
                type="button"
                className="note-icon-button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="note-form"
            >
              <label>
                Note title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter note title"
                  required
                  maxLength={150}
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Work">Work</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Note content
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write your note here..."
                  rows={6}
                  required
                  maxLength={5000}
                />
              </label>

              <div className="note-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId !== null ? "Save changes" : "Create note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
