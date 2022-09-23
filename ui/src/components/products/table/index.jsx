import { Table, Image } from "react-bootstrap";


function getEvolution(oldP, newP) {
  let percDiff =  (100 - oldP / newP * 100).toFixed(10)
  return (percDiff > 0 ? "- " : "+ ") + Math.abs(percDiff).toFixed(2) + (percDiff > 0 ? "% \u2193" : "% \u2191")
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
		<th></th>
      </tr>
      <tr>
        <th>brand</th>
        <th>image</th>
        <th>name</th>
        <th className="col-md-1">new price </th>
        <th className="col-md-2">old price</th>
        <th className="col-md-2">evolution</th>
		<th>ratings</th>
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
          src={(l.image).startsWith(storePrefix) ? l.image : storePrefix + l.image}
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
      <td>{l.oldPrice ? l.oldPrice + " €" : "change 'state' filter"}</td>
      <td>{l.oldPrice ? getEvolution(l.price, l.oldPrice) : "change 'state' filter"}</td>
	  <td>{l.stars != 'none' ? l.stars + "/5" : "no ratings"}</td>
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
