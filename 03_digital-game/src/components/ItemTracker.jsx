export default function ItemTracker({ items, eliminatedItemIds, onToggleItem }) {
  return (
    <section className="item-tracker" aria-labelledby="items-heading">
      <div className="panel-heading">
        <h2 id="items-heading">Missing Item Tracker</h2>
        <p>Cross off items as you narrow the case.</p>
      </div>
      <div className="item-list">
        {items.map((item) => {
          const eliminated = eliminatedItemIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={eliminated ? 'item-pill is-eliminated' : 'item-pill'}
              onClick={() => onToggleItem(item.id)}
            >
              <strong>{item.name}</strong>
              <span>{item.tags.join(' • ')}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
