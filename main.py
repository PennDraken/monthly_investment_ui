import tkinter as tk
from tkinter import ttk
from ttkthemes import ThemedStyle


def create_labeled_section(parent, label_text, row, column=0):
    """Helper function to create a section with a label, entry, and slider."""
    frame = tk.Frame(parent, bg=parent["bg"])
    frame.grid(row=row, column=column, pady=10, sticky="nsew")

    label = ttk.Label(frame, text=label_text, font=("Arial", 16), background=parent["bg"], foreground="white")
    label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

    entry = ttk.Entry(frame, font=("Arial", 16))
    entry.grid(row=1, column=0, padx=20, pady=10, sticky="ew")

    slider = ttk.Scale(frame, from_=0, to=100, orient="horizontal", length=400)
    slider.grid(row=1, column=1, padx=20, pady=10, sticky="ew")

    frame.grid_columnconfigure(0, weight=1)
    frame.grid_columnconfigure(1, weight=1)
    return frame


# Main window setup
root = tk.Tk()
root.title("Themed Tkinter UI")
root.geometry("1200x800")

# Apply theme and configure styles
style = ThemedStyle(root)
style.set_theme("black")
root.configure(bg="#2e2e2e")

# Left and Right frames
left_frame = tk.Frame(root, bg="#2e2e2e")
right_frame = tk.Frame(root, bg="#2e2e2e")
left_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
right_frame.grid(row=0, column=1, padx=20, pady=20, sticky="nsew")

# Labeled sections
create_labeled_section(left_frame, "Lumpsum", row=0)
create_labeled_section(left_frame, "Interest Rate", row=1)
create_labeled_section(left_frame, "Years", row=2)

# Bottom section on the left
new_row_frame = tk.Frame(left_frame, bg="#2e2e2e")
new_row_frame.grid(row=3, column=0, pady=10, sticky="nsew")
new_label = ttk.Label(new_row_frame, text="New Section", font=("Arial", 16), background="#2e2e2e", foreground="white")
new_label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

new_empty_frame = tk.Frame(new_row_frame, bg="gray")
new_empty_frame.grid(row=1, column=0, padx=20, pady=20, sticky="nsew")

new_row_frame.grid_rowconfigure(1, weight=1)
new_row_frame.grid_columnconfigure(0, weight=1)

# Right section content
label_right = ttk.Label(right_frame, text="Result", font=("Arial", 16), background="#2e2e2e", foreground="white")
label_right.grid(row=0, column=0, padx=20, pady=20, sticky="w")

empty_frame = tk.Frame(right_frame, bg="gray")
empty_frame.grid(row=1, column=0, padx=20, pady=20, sticky="nsew")

# Configure grid weights
root.grid_rowconfigure(0, weight=1)
root.grid_columnconfigure(0, weight=1, uniform="equal")
root.grid_columnconfigure(1, weight=1, uniform="equal")

left_frame.grid_rowconfigure(0, weight=1)
left_frame.grid_rowconfigure(1, weight=1)
left_frame.grid_rowconfigure(2, weight=1)
left_frame.grid_rowconfigure(3, weight=1)
left_frame.grid_columnconfigure(0, weight=1)

right_frame.grid_rowconfigure(1, weight=1)
right_frame.grid_columnconfigure(0, weight=1)

# Run the Tkinter loop
root.mainloop()
