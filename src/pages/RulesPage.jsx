import { useState } from 'react';
import './RulesPage.css';

const RULES_SECTIONS = [
  {
    id: 'basic',
    icon: '📋',
    title: 'Luật Cơ Bản',
    content: [
      {
        subtitle: '1. Quân trắng luôn đi trước',
        text: 'Người cầm quân trắng được quyền đi nước đầu tiên – tạo lợi thế chủ động.',
      },
      {
        subtitle: '2. Mỗi người chơi được đi 1 nước mỗi lượt',
        text: 'Hai người chơi thay phiên nhau di chuyển một quân duy nhất trong mỗi lượt.',
      },
      {
        subtitle: '3. Ăn quân đối phương',
        text: 'Nếu bạn di chuyển đến một ô có quân đối thủ, quân đó sẽ bị loại khỏi bàn cờ.',
      },
      {
        subtitle: '4. Không được tự ăn quân của mình',
        text: 'Không thể di chuyển đến một ô đã có quân cùng màu.',
      },
      {
        subtitle: '5. Bảo vệ Vua',
        text: 'Bạn không được phép thực hiện bất kỳ nước đi nào khiến Vua của bạn rơi vào thế bị chiếu.',
      },
    ]
  },
  {
    id: 'end',
    icon: '🏁',
    title: 'Kết Thúc Ván Cờ',
    content: [
      {
        subtitle: 'Chiếu bí (Checkmate)',
        text: 'Vua bị chiếu mà không có cách nào thoát – bạn thắng cuộc!',
      },
      {
        subtitle: 'Hòa cờ (Draw)',
        text: 'Có nhiều lý do dẫn đến hòa:',
        list: [
          'Hai bên không còn đủ quân để chiếu bí',
          'Thế cờ lặp lại 3 lần liên tiếp',
          'Hai bên cùng đồng ý hòa',
          '50 nước đi liên tiếp không có ăn quân hoặc di chuyển tốt',
        ]
      },
    ]
  },
  {
    id: 'pieces',
    icon: '♟',
    title: 'Cách Di Chuyển Quân Cờ',
    content: [
      {
        subtitle: '♙ Quân Tốt (Pawn)',
        text: 'Tốt chỉ đi một ô thẳng về phía trước. Ở nước đi đầu tiên, Tốt có thể đi hai ô. Tốt ăn chéo một ô về phía trước. Khi đến hàng cuối, Tốt được phong cấp thành quân khác.',
      },
      {
        subtitle: '♖ Quân Xe (Rook)',
        text: 'Xe di chuyển thẳng theo chiều dọc hoặc ngang, từ 1 đến 7 ô, miễn không có quân cản đường. Xe tham gia nước đi nhập thành cùng Vua.',
      },
      {
        subtitle: '♘ Quân Mã (Knight)',
        text: 'Mã di chuyển theo hình chữ L: 2 ô theo một hướng rồi rẽ 1 ô vuông góc. Mã là quân duy nhất có thể nhảy qua các quân khác.',
      },
      {
        subtitle: '♗ Quân Tượng (Bishop)',
        text: 'Tượng đi theo đường chéo, bao xa tùy ý. Mỗi Tượng chỉ đi trên một màu ô suốt ván đấu. Không thể nhảy qua quân khác.',
      },
      {
        subtitle: '♕ Quân Hậu (Queen)',
        text: 'Hậu kết hợp sức mạnh của Xe và Tượng – đi thẳng hoặc chéo không giới hạn. Là quân mạnh nhất trên bàn cờ.',
      },
      {
        subtitle: '♔ Quân Vua (King)',
        text: 'Vua di chuyển một ô mỗi lượt theo bất kỳ hướng nào. Không được đi vào ô bị đối phương khống chế. Vua tham gia nước đi nhập thành.',
      },
    ]
  },
  {
    id: 'castling',
    icon: '🏰',
    title: 'Nhập Thành (Castling)',
    content: [
      {
        subtitle: 'Mục đích',
        text: 'Đưa Vua về góc an toàn, tránh bị chiếu sớm. Đưa Xe ra trung tâm – sẵn sàng tham chiến.',
      },
      {
        subtitle: 'Điều kiện',
        list: [
          'Đây phải là nước đi đầu tiên của Vua và Xe',
          'Không có quân nào đứng giữa Vua và Xe',
          'Vua không đang bị chiếu',
          'Vua không đi qua ô đang bị kiểm soát',
        ]
      },
      {
        subtitle: 'Nhập thành gần (0-0)',
        text: 'Vua di chuyển 2 ô sang phải, Xe nhảy qua đứng sát bên trái Vua.',
      },
      {
        subtitle: 'Nhập thành xa (0-0-0)',
        text: 'Vua đi 2 ô sang trái, Xe nhảy qua đứng sát bên phải Vua.',
      },
    ]
  },
  {
    id: 'promotion',
    icon: '👑',
    title: 'Phong Cấp (Promotion)',
    content: [
      {
        subtitle: 'Quy tắc',
        text: 'Khi quân Tốt đi đến hàng cuối cùng (hàng 8 với trắng, hàng 1 với đen), nó phải được phong cấp.',
      },
      {
        subtitle: 'Lựa chọn phong cấp',
        list: [
          'Hậu (♕) – Lựa chọn phổ biến nhất, quân mạnh nhất',
          'Xe (♖)',
          'Tượng (♗)',
          'Mã (♘)',
        ]
      },
      {
        subtitle: 'Lưu ý',
        text: 'Không được phong thành Vua. Bạn hoàn toàn có thể có 2 quân Hậu, 3 Xe, hoặc 3 Mã trên bàn!',
      },
    ]
  },
  {
    id: 'enpassant',
    icon: '⚡',
    title: 'Bắt Tốt Qua Đường (En Passant)',
    content: [
      {
        subtitle: 'Tình huống xảy ra',
        text: 'Khi quân Tốt đối thủ vừa đi 2 ô từ vị trí ban đầu, và Tốt của bạn đang đứng ở hàng ngang bên cạnh.',
      },
      {
        subtitle: 'Cách thực hiện',
        text: 'Bạn có thể bắt quân Tốt đó "qua đường" như thể nó chỉ đi 1 ô.',
      },
      {
        subtitle: 'Lưu ý quan trọng',
        list: [
          'Phải thực hiện ngay lập tức, ở nước tiếp theo',
          'Nếu bạn không bắt ngay, cơ hội sẽ mất vĩnh viễn',
        ]
      },
      {
        subtitle: 'Ví dụ',
        text: 'Đối thủ có Tốt ở e7, đi 2 ô đến e5. Bạn có Tốt ở d5. → Bạn có thể đi dxe6, bắt Tốt e5.',
      },
    ]
  },
  {
    id: 'check',
    icon: '⚔️',
    title: 'Chiếu Vua & Chiếu Hết',
    content: [
      {
        subtitle: 'Mục tiêu cuối cùng',
        text: 'Chiếu hết (Checkmate) quân Vua đối phương – khiến Vua bị chiếu mà không có cách nào thoát.',
      },
      {
        subtitle: '3 cách thoát chiếu',
        list: [
          'Di chuyển Vua sang ô an toàn',
          'Chặn đòn chiếu bằng quân khác',
          'Ăn quân đang chiếu',
        ]
      },
      {
        subtitle: 'Chiếu hết',
        text: 'Nếu cả 3 cách trên đều không thực hiện được → Chiếu hết – người bị chiếu hết thua ván cờ ngay lập tức.',
      },
    ]
  },
  {
    id: 'setup',
    icon: '🎯',
    title: 'Cách Xếp Bàn Cờ',
    content: [
      {
        subtitle: 'Bàn cờ 8×8',
        text: 'Bàn cờ vua có kích thước 8×8 ô, xen kẽ trắng đen.',
      },
      {
        subtitle: 'Xếp quân',
        list: [
          'Hàng 1 (trắng) / Hàng 8 (đen): Xe – Mã – Tượng – Hậu – Vua – Tượng – Mã – Xe',
          'Hàng 2 (trắng) / Hàng 7 (đen): 8 quân Tốt dàn đều',
          'Hậu trắng đứng trên ô trắng, Hậu đen đứng trên ô đen',
        ]
      },
    ]
  },
];

export default function RulesPage({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('basic');
  const [expandedCards, setExpandedCards] = useState(new Set(['basic']));

  const toggleCard = (id) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setActiveSection(id);
  };

  return (
    <div className="rules-page">
      {/* Header */}
      <header className="rules-header">
        <button 
          id="btn-back-home"
          className="back-button"
          onClick={() => onNavigate('home')}
        >
          <span>←</span>
          <span>Trang Chủ</span>
        </button>
        <div className="rules-header-content">
          <h1 className="rules-title">
            <span className="rules-title-icon">📖</span>
            Luật Chơi Cờ Vua
          </h1>
          <p className="rules-description">
            Từ nước đi đầu tiên đến các thế cờ đặc biệt
          </p>
        </div>
      </header>

      {/* Navigation sidebar + content */}
      <div className="rules-layout">
        {/* Sidebar navigation */}
        <nav className="rules-nav">
          {RULES_SECTIONS.map(section => (
            <button
              key={section.id}
              className={`rules-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => {
                toggleCard(section.id);
                document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span className="nav-item-icon">{section.icon}</span>
              <span className="nav-item-text">{section.title}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="rules-content">
          {RULES_SECTIONS.map((section, idx) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className={`rules-card ${expandedCards.has(section.id) ? 'expanded' : ''}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <button
                className="rules-card-header"
                onClick={() => toggleCard(section.id)}
              >
                <div className="card-header-left">
                  <span className="card-icon">{section.icon}</span>
                  <h2 className="card-title">{section.title}</h2>
                </div>
                <span className={`card-chevron ${expandedCards.has(section.id) ? 'open' : ''}`}>
                  ▼
                </span>
              </button>

              <div className={`rules-card-body ${expandedCards.has(section.id) ? 'show' : ''}`}>
                {section.content.map((item, i) => (
                  <div key={i} className="rule-item">
                    <h3 className="rule-subtitle">{item.subtitle}</h3>
                    {item.text && <p className="rule-text">{item.text}</p>}
                    {item.list && (
                      <ul className="rule-list">
                        {item.list.map((li, j) => (
                          <li key={j}>{li}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Play CTA */}
          <div className="rules-cta">
            <p className="cta-text">Đã nắm rõ luật chơi?</p>
            <button 
              id="btn-play-from-rules"
              className="cta-button"
              onClick={() => onNavigate('game')}
            >
              <span>♟</span>
              <span>Bắt Đầu Chơi Ngay</span>
              <span>→</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
