import React from 'react';
import { DataTable, groupBy, multiSelectColumn } from '@elliemae/ds-data-table';
import { Grid } from '@elliemae/ds-grid';
import moment from 'moment';
import { orderBy } from 'lodash';
import { uid } from 'uid';

const columns = [
  {
    ...multiSelectColumn,
    Header: () => <div />,
  },
  {
    Header: 'id',
    accessor: 'uid',
  },
  {
    Header: 'Report',
    accessor: 'reportType',
  },
  {
    Header: 'Name',
    accessor: 'name',
    width: 250,
  },
  {
    Header: 'Reference Number',
    accessor: 'referenceNumber',
  },
  {
    Header: 'Order Date',
    width: 200,
    Cell: ({ row }) => {
      return moment(row.original.orderDate).format('MM/DD/YYYY HH:mm:ss A');
    },
  },
];

const REPORT_TYPE = ['Merge', 'RMCR', 'PreQual', 'MTR'];
const APPLICANT_NAMES = [
  'Andy America & Merry America',
  'John Homeowner & Julia Homeowner',
];

const generateRecord = (id) => {
  const date = moment().add(id + 1, 'minutes');
  return {
    id: id + 1,
    name:
      (id + 1) % 2
        ? `Andy America & Merry America`
        : 'John Homeowner & Julia Homeowner',
    reportType: REPORT_TYPE[Math.floor(Math.random() * 3)],
    referenceNumber: uid(10),
    orderDate: date.toISOString(),
    uid: `${id + 1}`,
  };
};

const genRows = (n) => new Array(n).fill({}).map((_, id) => generateRecord(id));

export const GroupByColumn = () => {
  const mockColumns = React.useMemo(() => columns, []);
  const originalData = React.useMemo(() => genRows(100), []);
  const [expandedRows, setExpandedRows] = React.useState({});
  const [selection, setSelection] = React.useState({});
  const [disabledRows, setDisabledRows] = React.useState({});

  const groupedData = React.useMemo(() => {
    const rows = groupBy(originalData, 'reportType');
    return rows.map((r) => {
      const sortedRows = r.subRows.sort(
        (a, b) => moment(b.orderDate).valueOf() - moment(a.orderDate).valueOf()
      );
      return { ...r, subRows: sortedRows };
    });
  }, [originalData]);

  const handleSelectionChange = React.useCallback(
    (row) => {
      const keys = Object.keys(row);
      setSelection(row);
      const foundSelectedRows = originalData.filter((r) =>
        keys.includes(r.uid)
      );
      // const groupedRows = lodashGroupBy(foundSelectedRows, 'reportType');
      const rowsToDisabled = foundSelectedRows.reduce((result, r) => {
        const rowsFoundForDisabledAction = originalData.reduce((acc, o) => {
          if (
            o.id !== r.id &&
            o.reportType === r.reportType &&
            o.name === r.name
          ) {
            acc[o.id] = true;
          }
          return acc;
        }, {});
        return { ...result, ...rowsFoundForDisabledAction };
      }, {});
      setDisabledRows(rowsToDisabled);
    },
    [originalData]
  );

  const selectedRows = React.useMemo(() => {
    const keys = Object.keys(selection);
    return JSON.stringify(
      originalData.filter((r) => keys.includes(r.uid)),
      null,
      4
    );
  }, [selection, originalData]);

  return (
    <Grid row={[1]} cols={[2, 1]} gutter="xxs" m="s">
      <DataTable
        columns={mockColumns}
        data={groupedData}
        isExpandable
        uniqueRowAccessor="uid"
        disabledRows={disabledRows}
        groupedRowsRenderHeader={(value, subRows) =>
          `${value} (${subRows.length})`
        }
        expandedRows={expandedRows}
        onRowExpand={setExpandedRows}
        selection={selection}
        onSelectionChange={(args) => {
          handleSelectionChange(args);
        }}
        getRowVariant={(row, args) => {
          if (row.original.dimsumHeaderValue) return 'ds-header-group-row';
          return (row.index & 1) === 1 ? 'ds-primary-row' : 'ds-secondary-row';
        }}
      />
      <div>
        <p>Selected Rows::</p>
        <pre
          style={{
            maxHeight: '500px',
            overflow: 'auto',
            background: 'rgba(0, 0, 0, 0.1)',
            padding: 16,
          }}
        >
          <code>{selectedRows}</code>
        </pre>
      </div>
    </Grid>
  );
};
