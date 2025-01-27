import tkinter as tk
from tkinter import ttk
from ttkthemes import ThemedStyle

def create_labeled_section(parent, label_text, row, from_=0, to=100, step=1, default_value=0, unit=""):
    """Helper function to create a section with a label, entry, slider, and unit label."""
    frame = tk.Frame(parent, bg=parent["bg"])
    frame.grid(row=row, column=0, pady=10, sticky="nsew")

    # Label for the section
    label = ttk.Label(frame, text=label_text, font=("Arial", 16), background=parent["bg"], foreground="white")
    label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

    # Entry to display the value
    entry = ttk.Entry(frame, font=("Arial", 16), justify="right")
    entry.grid(row=1, column=0, padx=20, pady=10, sticky="ew")

    # Slider for input
    slider = ttk.Scale(
        frame, from_=from_, to=to, orient="horizontal", length=400,
        command=lambda val: update_slider(val, entry, step)
    )
    slider.grid(row=1, column=1, padx=20, pady=10, sticky="ew")

    # Unit label
    unit_label = ttk.Label(frame, text=unit, font=("Arial", 16), background=parent["bg"], foreground="white")
    unit_label.grid(row=1, column=2, padx=10, sticky="w")

    # Set default value and update entry
    def initialize_slider():
        snapped_value = round(default_value / step) * step
        slider.set(snapped_value)  # Set slider to the default value
        entry.delete(0, tk.END)   # Clear the entry box
        entry.insert(0, f"{int(snapped_value)}")  # Insert the default value

    initialize_slider()

    # Configure column weights
    frame.grid_columnconfigure(0, weight=1)
    frame.grid_columnconfigure(1, weight=2)
    frame.grid_columnconfigure(2, weight=0)

    return frame


def update_slider(value, entry_widget, step):
    """Round the slider value to the nearest multiple of step and update entry with no decimals."""
    value = float(value)
    snapped_value = round(value / step) * step
    entry_widget.delete(0, tk.END)
    entry_widget.insert(0, f"{int(snapped_value)}")


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

# Labeled sections with default values and units
create_labeled_section(left_frame, "Lumpsum", row=0, from_=0, to=1_000_000, step=10_000, default_value=100_000, unit="kr")
create_labeled_section(left_frame, "Interest Rate", row=1, from_=0, to=20, step=1, default_value=7, unit="%")
create_labeled_section(left_frame, "Years", row=2, from_=1, to=50, step=1, default_value=10, unit="years")


# Create the dynamic grid in the bottom left section based on the number of years
def create_interactive_grid():
    # Get the number of years value
    years = int(left_frame.winfo_children()[2].winfo_children()[1].get())  # Years value
    num_columns = years
    num_rows = 40  # Number of rows fixed at 40
    points = []  # Store points clicked on by the user
    

    # Helper function for drawing the points on click
    def draw_point(event, column_index):
        # Dynamically fetch the current canvas dimensions
        frame_width = canvas.winfo_width()
        frame_height = canvas.winfo_height()

        # Calculate row and column from mouse click
        row_index = int(event.y // (frame_height // num_rows))  # Use current frame height
        col_index = int(event.x // (frame_width // num_columns))
        points.append((col_index, row_index))  # Store the (column, row) clicked
        draw_all_points()

    def draw_all_points():
        frame_width = canvas.winfo_width()
        frame_height = canvas.winfo_height()
        for column, row in points:
            canvas.create_oval(
                (frame_width / num_columns) * column + 2, (frame_height / num_rows) * row + 2,
                (frame_width / num_columns) * column + 15, (frame_height / num_rows) * row + 15,
                fill="red", outline="red"
            )

    # Create the frame for interactive grid
    grid_frame = tk.Frame(left_frame, bg="gray")
    grid_frame.grid(row=3, column=0, pady=10, sticky="nsew")
    grid_frame.grid_rowconfigure(0, weight=1)
    grid_frame.grid_columnconfigure(0, weight=1)

    # Set canvas and allow resizing to fill the grid container
    canvas = tk.Canvas(grid_frame, bg="white")
    canvas.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

    # Helper function to update grid
    def update_grid(event=None):
        # Get actual width and height of grid frame
        frame_width = grid_frame.winfo_width()
        frame_height = grid_frame.winfo_height()

        # Clear previous grid (optional, to prevent overlap on resize)
        canvas.delete("all")

        # Draw new grid based on updated dimensions
        for col in range(num_columns):
            canvas.create_line((frame_width / num_columns) * col, 0,
                                (frame_width / num_columns) * col, frame_height, fill="black")

        for row in range(num_rows):
            canvas.create_line(0, (frame_height / num_rows) * row, frame_width,
                                (frame_height / num_rows) * row, fill="black")

    # Update grid when window is resized
    grid_frame.bind("<Configure>", update_grid)

    # Initial draw of the grid
    update_grid()

    # Bind click event on canvas to add point
    canvas.bind("<Button-1>", lambda event: draw_point(event, 0))  # Keep `column_index=0` for now



# Initialize interactive grid after "Years" value
create_interactive_grid()

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
left_frame.grid_rowconfigure(3, weight=3)
left_frame.grid_columnconfigure(0, weight=1)

right_frame.grid_rowconfigure(1, weight=1)
right_frame.grid_columnconfigure(0, weight=1)

# Run the Tkinter loop
root.mainloop()
