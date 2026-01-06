-- Add blog posts for staymoxie-template-single
-- Organization ID: b0000000-0000-0000-0000-000000000001

-- Allow NULL for created_by on blog_posts for template data  
ALTER TABLE blog_posts ALTER COLUMN created_by DROP NOT NULL;

-- Create 3 blog posts (drafts) with valid content_type 'article'
INSERT INTO blog_posts (
  id, organization_id, title, slug, excerpt, content, author, status, 
  image_url, tags, content_type, is_featured, is_active
) VALUES
(
  '20000000-0000-0000-0001-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Top 10 Things to Do Near Mountain View Cabin',
  'top-10-things-to-do-near-mountain-view-cabin',
  'Discover the best activities and attractions within easy reach of your mountain retreat, from scenic hikes to local dining gems.',
  '<h2>Make the Most of Your Mountain Getaway</h2>

<p>Staying at Mountain View Cabin puts you right in the heart of Colorado''s most beautiful outdoor playground. Whether you''re seeking adventure or relaxation, there''s something for everyone just minutes from your door.</p>

<h3>1. Summit Ridge Trail</h3>
<p>Just 2.5 miles away, this 4-mile loop offers stunning panoramic views and is perfect for morning hikes. The trail is well-marked and suitable for intermediate hikers.</p>

<h3>2. Crystal Lake</h3>
<p>This pristine alpine lake is ideal for kayaking, fishing, or simply enjoying a peaceful picnic. Boat rentals are available during summer months, and the sunset views are unforgettable.</p>

<h3>3. Pine Valley Ski Area</h3>
<p>Winter visitors will love this family-friendly resort just 15 miles away. With 45 trails for all skill levels, plus snowshoeing and tubing, there''s winter fun for everyone.</p>

<h3>4. Highland Vineyards</h3>
<p>Treat yourself to a wine tasting at this award-winning mountain winery. Their high-altitude wines have unique flavor profiles you won''t find anywhere else.</p>

<h3>5. Historic Downtown Millbrook</h3>
<p>Just 5 miles away, this charming main street is lined with local boutiques, antique shops, and cafes. Don''t miss the Saturday farmers market!</p>

<h3>6. Sunset Peak Overlook</h3>
<p>A short 20-minute drive brings you to one of the most spectacular sunset viewing spots in the region. Bring a blanket and a bottle of wine from Highland Vineyards.</p>

<h3>7. Mountain House Grill</h3>
<p>When you don''t feel like cooking, this locally-owned restaurant serves hearty mountain cuisine with farm-to-table ingredients. Try their famous elk burger!</p>

<h3>8. River Canyon Hot Springs</h3>
<p>Natural hot springs pools overlooking the river make for a perfect relaxation day. Open year-round, it''s especially magical in winter with snow falling around you.</p>

<h3>9. Blue River Fly Fishing</h3>
<p>The Gold Medal waters of the Blue River offer world-class trout fishing. Local guides can help beginners and experienced anglers alike.</p>

<h3>10. Stargazing from Your Deck</h3>
<p>Sometimes the best activity is right at the cabin! With minimal light pollution, the night sky here is spectacular. The hot tub makes the perfect stargazing spot.</p>

<p><em>Ready to start planning your mountain adventure? Book your stay at Mountain View Cabin today!</em></p>',
  'Mountain View Cabin',
  'draft',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
  ARRAY['activities', 'local guide', 'things to do', 'outdoor'],
  'article',
  true,
  true
),
(
  '20000000-0000-0000-0001-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'The Perfect Weekend Getaway Itinerary',
  'perfect-weekend-getaway-itinerary',
  'Plan your ideal mountain escape with our day-by-day guide to making the most of a weekend at Mountain View Cabin.',
  '<h2>Your 3-Day Mountain Escape</h2>

<p>A weekend at Mountain View Cabin is the perfect reset from busy daily life. Here''s how to make every moment count.</p>

<h3>Day 1: Arrival & Unwind</h3>

<p><strong>Afternoon:</strong> Arrive at the cabin and take your time settling in. Explore your home for the weekend – check out those mountain views from every window!</p>

<p><strong>Evening:</strong> Fire up the BBQ grill for a casual dinner on the deck. As the sun sets, pour a glass of wine and watch the sky turn pink and gold over the peaks. End the night with a soak in the hot tub under the stars.</p>

<h3>Day 2: Adventure Day</h3>

<p><strong>Morning:</strong> Fuel up with a homemade breakfast in the fully-equipped kitchen, then head out early to Summit Ridge Trail. The morning light makes for the best photos!</p>

<p><strong>Afternoon:</strong> Drive to Historic Downtown Millbrook for lunch at a local cafe and browse the charming shops. Pick up some local treats for later.</p>

<p><strong>Evening:</strong> Return to the cabin for some downtime. Play board games by the fireplace, read a book in the cozy living room, or catch up on conversation without the distractions of everyday life.</p>

<h3>Day 3: Slow Morning & Departure</h3>

<p><strong>Morning:</strong> Sleep in! Make a leisurely brunch and enjoy your last hours in paradise. Take a final walk around the property, breathe in that mountain air, and snap a few photos.</p>

<p><strong>Before You Go:</strong> Leave refreshed, recharged, and already planning your return visit.</p>

<p><em>Pro tip: Extend your stay! Our mid-week rates make a 4-5 night getaway surprisingly affordable.</em></p>',
  'Mountain View Cabin',
  'draft',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200',
  ARRAY['itinerary', 'weekend getaway', 'travel tips', 'planning'],
  'article',
  false,
  true
),
(
  '20000000-0000-0000-0001-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  'Why Mountain Retreats Make the Best Family Vacations',
  'mountain-retreats-best-family-vacations',
  'Discover why a cabin getaway creates lasting family memories and offers something special for every generation.',
  '<h2>Creating Memories That Last a Lifetime</h2>

<p>In a world of theme parks and crowded resorts, there''s something magical about gathering your family in a cozy mountain cabin. Here''s why families keep coming back to Mountain View Cabin year after year.</p>

<h3>Unplug and Reconnect</h3>

<p>Without the distractions of daily routines, families actually talk to each other again. Board game nights by the fireplace, cooking meals together, and sharing stories on the deck create bonds that no screen can replicate.</p>

<h3>Adventure for Every Age</h3>

<p>Grandparents can relax on the deck with a book while parents and kids explore nearby trails. Teens love the hot tub and WiFi, while little ones are enchanted by wildlife sightings and s''mores by the fire pit. Everyone finds their happy place.</p>

<h3>Space to Spread Out</h3>

<p>Unlike cramped hotel rooms, a cabin gives everyone room to breathe. Three bedrooms mean grandparents get privacy, parents get a retreat, and kids have their own space for sleepovers and pillow fights.</p>

<h3>Nature as the Playground</h3>

<p>No admission fees, no lines, no schedules. The mountains are open 24/7 and offer endless entertainment – from identifying constellations to spotting deer at dawn to building snowmen in winter.</p>

<h3>Traditions Start Here</h3>

<p>The Anderson family said it best in their review: "This cabin has become our new favorite family tradition spot." Many of our guests return year after year, watching their children grow up with mountain memories.</p>

<p><em>Ready to start your family''s mountain tradition? Book Mountain View Cabin for your next gathering.</em></p>',
  'Mountain View Cabin',
  'draft',
  'https://images.unsplash.com/photo-1536939459926-301728717817?w=1200',
  ARRAY['family travel', 'vacation tips', 'cabin life', 'family memories'],
  'article',
  false,
  true
);