flowchart TD

A0["User opens site"] --> A1["Show initial layout with camera area, canvas, settings icon, hint text"]
A1 --> A2["Request camera permission"]
A2 -->|Granted| A3["Show webcam in lens and enable spacebar capture"]
A2 -->|Denied or error| A4["Show error state and disable shutter"]
A3 --> B0
A4 --> B0

B0{"Camera ready"} --No--> B1["Ignore capture attempt and show warning toast"]
B0 --Yes--> B2["User triggers capture via shutter button or spacebar"]
B2 --> B3["Play shutter animation"]
B3 --> B4["Capture current webcam frame"]
B4 --> B5["Create new polaroid object"]
B5 --> B6["Animate printing from camera slot"]
B6 --> B7["Place polaroid into canvas and enable interactions"]

B7 --> C0
C0["User hovers photo"] --> C1["User drags photo"]
C1 --> C2["Update canvas position and bring to front"]
C2 --> C3["User releases drag"]
C3 --> C4["Photo position saved"]

C4 --> D0
D0["User double-clicks photo"] --> D1["Show caption input"]
D1 --> D2{"User action"}
D2 --Enter or outside click--> D3["Save caption text"]
D2 --Cancel or ESC--> D4["Discard changes"]

C4 --> E0
E0["User right-clicks photo"] --> E1["Show context menu"]
E1 --Copy image--> E2["Render and copy image to clipboard"]
E1 --Download--> E3["Trigger image download dialog"]
E1 --Copy link--> E4["Copy current URL"]
E2 --> E5["Close context menu"]
E3 --> E5
E4 --> E5
E1 --Outside click or ESC--> E5

A1 --> F0
F0["User opens settings panel"] --> F1["Settings panel displayed"]
F1 --> F2["User selects background color"]
F2 --> F3["Preview updated"]
F3 --> F4["Apply background color for future photos"]
F1 --Close panel--> F5["Settings panel closed"]
