import { Table, Image } from "react-bootstrap";


function getEvolution(oldP, newP) {
  let arrow = {
    up: "↗", //↗
    down : "↘" // ↘
  }
  let percDiff =  (100 - oldP / newP * 100).toFixed(10)
  return Math.abs(percDiff).toFixed(2) + (percDiff > 0 ? arrow.up : arrow.down)
}
function TableHeader({ liveSearch }) {
  return (
    <thead>
      <tr>
        <th>
          <input
            type="text"
            placeholder="filter here..."
            onChange={liveSearch("brand")}
          />
        </th>
        <th></th>
        <th>
          <input
            type="text"
            placeholder="filter here..."
            onChange={liveSearch("name")}
          />
        </th>
        <th></th>
        <th></th>
        <th></th>
        <th>
          <input
            type="text"
            placeholder="filter here..."
            onChange={liveSearch("updated_at")}
          />
        </th>
      </tr>
      <tr>
        <th>brand</th>
        <th>image</th>
        <th>name</th>
        <th className="col-md-1">price </th>
        <th>old price</th>
        <th>evolution</th>
        <th>updated_at</th>
      </tr>
    </thead>
  );
}

function TableRow({l, onClickImage, storePrefix}) {
  return (
    <tr>
      <td>{l.brand}</td>
      <td className="p-0">
        <Image
          src={l.image}
          height={50}
          loading={"lazy"}
          onClick={onClickImage}
        ></Image>
      </td>
      <td>
        {l.name} -{" "}
        <a target="_blank" rel="noreferrer" href={storePrefix + l.url}>
          click
        </a>
      </td>
      <td>{l.price} € </td>
      <td>{l.oldPrice} </td>
      <td>{l.oldPrice ? getEvolution(l.price, l.oldPrice)  : "-"}</td>
      <td className="text-nowrap">{l.updated_at.split(" ")[0]}</td>
    </tr>
  );
}
export function ProdsTable({
  liveSearch,
  data,
  paginations,
  onClickImage,
  store,
}) {
  return (
    <Table striped bordered hover>
      <TableHeader liveSearch={liveSearch} />
      <tbody>
        {data
          .slice(
            paginations.page * paginations.perpage,
            paginations.perpage * (paginations.page + 1)
          )
          .map((l, i) => (
           <TableRow key={`product-${l.id}`} l={l} onClickImage={onClickImage} storePrefix={store.prefix}/>
          ))}
      </tbody>
    </Table>
  );
}
