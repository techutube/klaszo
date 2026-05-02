import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import './Breadcrumbs.css';

/**
 * Converts a URL slug into a human-readable title.
 * e.g., "class-10-agni" → "Class 10 Agni"
 */
const slugToTitle = (slug) => {
  // If it looks like a UUID, return null so it can be resolved via labels prop
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(slug)) return null;

  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Defines URL segment keys that should be treated as path separators
 * and not shown as breadcrumb labels.
 */
const SKIP_SEGMENTS = new Set(['course', 'subject', 'chapter', 'content']);

/**
 * @param {Object} labels - Optional map of { segmentValue: 'Human Label' }
 *   Used to resolve UUIDs (chapter IDs, content IDs) to readable names.
 *   e.g., { 'd94f55d0-...': 'Chemical Reactions and Equations' }
 */
const Breadcrumbs = ({ labels = {} }) => {
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = [];
  let cumulativePath = '';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    cumulativePath += `/${seg}`;

    if (SKIP_SEGMENTS.has(seg)) {
      continue;
    }

    // Resolve the label: check the passed-in map first, then slug conversion
    const resolvedLabel = labels[seg] || slugToTitle(seg);

    // If we couldn't resolve a label (it's an unresolved UUID), skip it
    if (!resolvedLabel) continue;

    crumbs.push({
      label: resolvedLabel,
      path: cumulativePath,
    });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <div className="breadcrumb-inner">
        <span className="breadcrumb-icon">
          <Menu size={16} />
        </span>

        <Link to="/" className="breadcrumb-item breadcrumb-link">
          Home
        </Link>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={crumb.path} className="breadcrumb-segment">
              <span className="breadcrumb-separator">›</span>
              {isLast ? (
                <span className="breadcrumb-item breadcrumb-current">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-item breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
