import { useState } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme, DataGrid, DataGridHeader, DataGridBody, DataGridRow, DataGridCell, DataGridHeaderCell, createTableColumn } from "@fluentui/react-components";

const items = [{ id: "alpha", name: "Alpha" }, { id: "beta", name: "Beta" }];
const columns = [createTableColumn({ columnId: "name", renderHeaderCell: () => "Name", renderCell: (item) => item.name })];
function App() {
  const [selected, setSelected] = useState(new Set(["alpha"]));
  return <FluentProvider theme={webLightTheme}>
    <main>
      <h1>Controlled row selection</h1>
      <DataGrid items={items} columns={columns} getRowId={(item) => item.id} selectionMode="single" selectedItems={selected} onSelectionChange={(_event, data) => setSelected(data.selectedItems)} aria-label="Records">
        <DataGridHeader><DataGridRow>{({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}</DataGridRow></DataGridHeader>
        <DataGridBody>{({ item, rowId }) => <DataGridRow key={rowId} selectionCell={{ radioIndicator: { "aria-label": `Select ${item.name}` } }}>
          {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
        </DataGridRow>}</DataGridBody>
      </DataGrid>
      <p id="selection">{[...selected].join(",")}</p>
    </main>
  </FluentProvider>;
}
createRoot(document.getElementById("root")).render(<App />);
