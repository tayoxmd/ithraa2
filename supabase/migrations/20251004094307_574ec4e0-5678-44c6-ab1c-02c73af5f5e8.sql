-- Update hotel images to use public folder paths
-- Makkah hotels (20 hotels - using images 1-5 repeated)
UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-1.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Dar Al Tawhid InterContinental';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-2.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Swissotel Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-3.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Hyatt Regency Makkah Jabal Omar';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-4.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Hilton Makkah Convention';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-5.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Makkah Marriott Hotel';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-1.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Pullman ZamZam Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-2.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Fairmont Makkah Clock Royal Tower';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-3.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Elaf Kinda Hotel';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-4.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Radisson Blu Hotel Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-5.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Mövenpick Hotel & Residence Hajar';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-1.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Sheraton Makkah Jabal Al Kaaba';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-2.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Anjum Hotel Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-3.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Crowne Plaza Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-4.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Conrad Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-5.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Address Jabal Omar Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-1.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Millennium Makkah Al Naseem';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-2.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Le Méridien Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-3.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Raffles Makkah Palace';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-4.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Jabal Omar Marriott Hotel Makkah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/makkah-5.jpg')
WHERE city_id = '6d183a09-b8c4-42ed-a109-e94f99568660' 
AND name_en = 'Makkah Clock Royal Tower - A Fairmont Hotel';

-- Madinah hotels (10 hotels)
UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-1.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Oberoi Madinah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-2.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Anwar Al Madinah Movenpick';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-3.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Al Madinah Harmony Hotel';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-4.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Millennium Taiba Hotel';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-5.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Shaza Al Madinah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-6.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Pullman ZamZam Madinah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-7.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Madinah Hilton Hotel';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-8.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Crowne Plaza Madinah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-9.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'InterContinental Dar Al Iman';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/madinah-10.jpg')
WHERE city_id = '0f8c6556-f310-4d07-bd7e-052060ed8535' 
AND name_en = 'Rove Al Madinah Hotel';

-- Riyadh hotels (10 hotels)
UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-1.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Four Seasons Hotel Riyadh';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-2.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'The Ritz-Carlton Riyadh';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-3.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Al Faisaliah Hotel';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-4.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Kingdom Centre Riyadh';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-5.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Narcissus Hotel Riyadh';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-6.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Burj Rafal Hotel Kempinski';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-7.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Radisson Blu Hotel Riyadh';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-8.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Crowne Plaza Riyadh';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-9.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Sheraton Riyadh Hotel';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/riyadh-10.jpg')
WHERE city_id = 'f958a385-0b98-4ea3-bf3e-5bd17dc5e538' 
AND name_en = 'Marriott Riyadh Diplomatic Quarter';

-- Jeddah hotels (10 hotels)
UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-1.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Park Hyatt Jeddah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-2.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Rosewood Jeddah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-3.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Jeddah Hilton';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-4.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'InterContinental Jeddah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-5.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Radisson Blu Plaza Jeddah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-6.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Movenpick Hotel Jeddah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-7.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Crowne Plaza Jeddah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-8.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Centro Shaheen Jeddah';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-9.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Jeddah Marriott Hotel Madinah Road';

UPDATE public.hotels 
SET images = jsonb_build_array('/images/hotels/jeddah-10.jpg')
WHERE city_id = '02f19a19-bfff-495c-8dd1-b1b57ff06634' 
AND name_en = 'Fairmont Jeddah';