import tkinter as tk
from tkinter import ttk
from ttkthemes import ThemedStyle
import numpy as np
from calculator import calculate_monthly_capital

def create_labeled_section(parent, label_text, row, from_=0, to=100, step=1, default_value=0, unit="", on_value_change=None):
    """Helper function to create a section with a label, entry, slider, and unit label."""
    frame = tk.Frame(parent, bg=parent["bg"])
    frame.grid(row=row, column=0, pady=10, sticky="nsew")

    # Label for the section
    label = ttk.Label(frame, text=label_text, font=("Arial", 16), background=parent["bg"], foreground="white")
    label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

    # Entry to display the value
    entry = ttk.Entry(frame, font=("Arial", 24, "bold"), justify="right")
    entry.grid(row=1, column=0, padx=20, pady=10, sticky="ew")

    # Slider for input
    slider = ttk.Scale(
        frame, from_=from_, to=to, orient="horizontal", length=400,
        command=lambda val: update_slider(val, entry, step, on_value_change)
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
        entry.insert(0, f"{int(snapped_value):,.0f}".replace(",", " "))

    initialize_slider()

    # Configure column weights
    frame.grid_columnconfigure(0, weight=1)
    frame.grid_columnconfigure(1, weight=2)
    frame.grid_columnconfigure(2, weight=0)

    return frame


def update_slider(value, entry_widget, step, on_value_change=None):
    """Round the slider value to the nearest multiple of step and update entry with no decimals."""
    value = float(value)
    snapped_value = round(value / step) * step
    entry_widget.delete(0, tk.END)
    entry_widget.insert(0, f"{int(snapped_value):,.0f}".replace(",", " "))
    if on_value_change:
        on_value_change(snapped_value)

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

default_years = 10
monthly_investment_points = np.zeros(100)  # Store points clicked on by the user

# Create the dynamic grid in the bottom left section based on the number of years
def create_interactive_grid():
    global monthly_investment_points
    global num_rows

    # Initialize the required variables
    years = int(left_frame.winfo_children()[2].winfo_children()[1].get().replace(" ", ""))
    num_columns = years
    num_rows = 20

    # Helper function for drawing the points on click
    def draw_point(event, column_index):
        global monthly_investment_points
        global num_rows

        frame_width = canvas.winfo_width()
        frame_height = canvas.winfo_height()
        years = int(left_frame.winfo_children()[2].winfo_children()[1].get().replace(" ", ""))
        num_columns = years

        row_index = num_rows - int((event.y + (frame_height // (2 * num_rows))) // (frame_height // num_rows))
        col_index = int((event.x + (frame_width // (2 * num_columns))) // (frame_width // num_columns))

        monthly_investment_points[col_index] = row_index
        num_rows = int(max(20, max(monthly_investment_points + [5])))
        draw_all_points()

    # Create the frame for interactive grid
    grid_frame = tk.Frame(left_frame, bg="gray")
    grid_frame.grid(row=3, column=0, pady=0, sticky="nsew")
    grid_frame.grid_rowconfigure(0, weight=1)
    grid_frame.grid_columnconfigure(0, weight=1)

    # Set canvas and allow resizing to fill the grid container
    canvas = tk.Canvas(grid_frame, bg="gray")
    canvas.grid(row=0, column=0, padx=0, pady=0, sticky="nsew")

    # Function to update grid and redraw
    def update_grid(event=None):
        frame_width = grid_frame.winfo_width()
        frame_height = grid_frame.winfo_height()
        years = int(left_frame.winfo_children()[2].winfo_children()[1].get().replace(" ", ""))
        num_columns = years

        canvas.delete("all")

        for col in range(num_columns):
            canvas.create_line((frame_width / num_columns) * col, 0,
                               (frame_width / num_columns) * col, frame_height, fill="black")

        for row in range(num_rows):
            canvas.create_line(0, (frame_height / num_rows) * row, frame_width,
                               (frame_height / num_rows) * row, fill="black")

    def draw_all_points():
        global monthly_investment_points
        global num_rows
        update_grid()

        frame_width = grid_frame.winfo_width()
        frame_height = grid_frame.winfo_height()
        years = int(left_frame.winfo_children()[2].winfo_children()[1].get().replace(" ", ""))
        num_columns = years

        r = int(frame_width / num_columns / 8)
        for column, row in enumerate(monthly_investment_points):
            canvas.create_oval(
                (frame_width / num_columns) * column - r, (frame_height / num_rows) * (num_rows - row) - r,
                (frame_width / num_columns) * column + r, (frame_height / num_rows) * (num_rows - row) + r,
                fill="white", outline="white"
            )
            canvas.create_line(
                (frame_width / num_columns) * column, (frame_height / num_rows) * (num_rows - row),
                (frame_width / num_columns) * column, frame_height, fill="white", width=r
            )
            canvas.create_text(
                (frame_width / num_columns) * column, (frame_height / num_rows) * (num_rows - row) - 4 * r,
                text=f"{(row * 1000):,.0f}".replace(",", " "), font=("Arial", 16, "bold"),
                fill="white"
            )

    # Use .after() to draw the initial grid after the layout is done
    grid_frame.after(50, lambda: [update_grid(), draw_all_points()])

    # Redraw grid when resized
    grid_frame.bind("<Configure>", update_grid)

    # Bind click event on canvas to add point
    canvas.bind("<Button-1>", lambda event: draw_point(event, 0))



def update_years(years):
    global monthly_investment_points
    # monthly_investment_points = np.zeros(value)  # Update points array with new years value
    # monthly_investment_points = np.pad(monthly_investment_points, years)
    create_interactive_grid()  # Redraw the grid with the new years count


# Labeled sections with default values and units
create_labeled_section(left_frame, "Lumpsum", row=0, from_=0, to=1_000_000, step=10_000, default_value=740_000, unit="kr")
create_labeled_section(left_frame, "Interest Rate", row=1, from_=0, to=20, step=1, default_value=7, unit="%")
create_labeled_section(
    left_frame, "Years", row=2, from_=1, to=50, step=1, default_value=default_years, unit="years",
    on_value_change=lambda value: update_years(int(value))
)



num_columns = int(left_frame.winfo_children()[2].winfo_children()[1].get())
# monthly_investment_points = np.zeros(num_columns)  # Store points clicked on by the user




def calculate():
    print("Pressed calculate")
    # Need to fix formatting
    lumpsum = int(left_frame.winfo_children()[0].winfo_children()[1].get().replace(" ", ""))
    rate    = int(left_frame.winfo_children()[1].winfo_children()[1].get().replace(" ", "")) / 100
    years   = int(left_frame.winfo_children()[2].winfo_children()[1].get().replace(" ", ""))
    monthly_savings = monthly_investment_points * 1000
    y_points = np.array(calculate_monthly_capital(lumpsum, monthly_savings[:years], rate))
    # Plot the points
    canvas = tk.Canvas(result_frame, bg="gray")
    canvas.grid(row=0, column=0, padx=0, pady=0, sticky="nsew")
    result_frame.grid_rowconfigure(0, weight=1)
    result_frame.grid_columnconfigure(0, weight=1)
    frame_width = result_frame.winfo_width()
    frame_height = result_frame.winfo_height()

    # Clear previous grid (optional, to prevent overlap on resize)
    canvas.delete("all")

    # Draw function
    col_width = frame_width / len(y_points)
    inc = 100_000
    row_height = frame_height / ((int(max(y_points) / inc) + 1)*inc)

    # Draw horsiontal lines
    lines_y = []
    num_lines = int(max(y_points) // inc + 1)
    for line in range(num_lines):
        lines_y.append(line * inc)

    # 13000 / 1000 = 
    # Horisontal lines
    for _, row in enumerate(lines_y):
        canvas.create_line(
            0,           frame_height - row_height * row,
            frame_width, frame_height - row_height * row,
            fill="black"
        )

    # Vertical lines
    year_width = frame_width / years
    for year in range(years):
        canvas.create_line(
            year * year_width, 0,
            year * year_width, frame_height,
            fill="black"
        )
        # Year label
        canvas.create_text(
            year * year_width + year_width/5, frame_height,
            text=f"{year}", fill="white", font=("Arial", 12), anchor="s"
        )

    
    r = 5
    for column, row in enumerate(y_points):
        canvas.create_oval(
            col_width * column - r, frame_height - row_height * row - r,
            col_width * column + r, frame_height - row_height * row + r,
            fill="black", outline="black"
        )

        
    for column, row in enumerate(y_points):
        if column != 0 and column != len(y_points) - 1 and column % 12 == 0:
            canvas.create_text(
                column * col_width,  # X position at the left side of the canvas
                frame_height - y_points[column] * row_height,  # Y position for the first value
                text=f"{y_points[column]:,.0f} kr".replace(",", " "), fill="white", font=("Arial", 12)
            )

    # Show first and last value
    # Show first value (position at the left edge)
    canvas.create_text(
        0 * col_width,  # X position at the left side of the canvas
        frame_height - y_points[0] * row_height,  # Y position for the first value
        text=f"{y_points[0]:,.0f} kr".replace(",", " "), fill="white", font=("Arial", 36), anchor="w"
    )

    # Show last value (position at the right edge)
    canvas.create_text(
        (len(y_points) - 1) * col_width,  # X position at the right side of the canvas
        frame_height - (y_points[-1] * row_height),  # Y position for the last value
        text=f"{y_points[-1]:,.0f} kr".replace(",", " "), fill="white", font=("Arial", 36), anchor="ne"
    )



# Initialize interactive grid after "Years" value


# Right section content
label_right = ttk.Label(right_frame, text="Result", font=("Arial", 16), background="#2e2e2e", foreground="white")
label_right.grid(row=0, column=0, padx=20, pady=20, sticky="w")

result_right = ttk.Button(right_frame, text="Calculate", command=calculate)
result_right.grid(row=2, column=0, padx=20, pady=20, sticky="w")

result_frame = tk.Frame(right_frame, bg="gray")
result_frame.grid(row=1, column=0, padx=20, pady=20, sticky="nsew")

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

create_interactive_grid()

# Run the Tkinter loop
root.mainloop()
