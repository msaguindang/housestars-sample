<?php

namespace App\Http\Controllers;

use App\Reviews;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use View;
use Sentinel;
use App\UserMeta;
use Response;
use Socialite;
class ReviewController extends Controller
{

	protected $payload;

	public function __construct(Request $request)
	{
		$this->payload = $request;
	}

	public function review(){

		$request = $this->payload;

    	//dd($request->all());
    	$user_id = Sentinel::getUser()->id;
    	$id = $request->input('id');

    	$tradesmen = DB::table('users')
				        ->join('user_meta', function ($join) use ($id) {
				            $join->on('users.id', '=', 'user_meta.user_id')
				                 ->where('user_meta.user_id', '=', $id);
				        })->get();

		$data['name'] = $tradesmen[0]->name;
		$data['photo'] = 'assets/default.png';

		foreach ($tradesmen as $tradesman) {
			if($tradesman->meta_name == 'profile-photo'){
				$data['photo'] = $tradesman->meta_value;
			}
		}

		 return Response::json($data, 200); 
    }

    public function addReview(){

		$request = $this->payload;

    	$user_id = Sentinel::getUser()->id;

    	DB::table('reviews')->insert(
            	['reviewee_id' => $request->input('tradesman_id'), 'reviewer_id' => $user_id, 'communication' => $request->input('communication'), 'work_quality' => $request->input('work-quality'), 'price' => $request->input('price'), 'punctuality' => $request->input('punctuality'), 'attitude' => $request->input('attitude'), 'title' => $request->input('review-title'), 'content' => $request->input('review-text'), 'created_at' => Carbon::now()]
            );

    	$data['id'] = $request->input('tradesman_id');
    	
    	return Response::json($data, 200); 
    }
	
	public function getAllReviews()
	{

		$payload = $this->payload->all();
		$pageNo = 1;
		$limit = 10;

		if(isset($payload['page_no'])){
			$pageNo = $payload['page_no'];
		}

		if(isset($payload['limit'])){
			$limit = $payload['limit'];
		}

		$offset = $limit*($pageNo-1);

		$length = DB::table('reviews')
			->selectRaw('count(*) as length')
			->first()
			->length;

		$sql = "SELECT 
				  reviews.*,
				  (SELECT 
					users.`name` 
				  FROM
					users 
				  WHERE users.id = reviews.`reviewee_id`) AS reviewee_name,
				  (SELECT 
					users.`name` 
				  FROM
					users 
				  WHERE users.id = reviews.`reviewer_id`) AS reviewer_name 
				FROM
				  reviews 
				LIMIT {$limit}
				OFFSET {$offset}";

		$reviews = json_decode(json_encode(DB::select($sql)),TRUE);

		$response = [
			'reviews' => $reviews,
			'length' => $length
		];

		return Response::json($response, 200);
	}

	public function deleteReview()
	{
		$id = $this->payload->input('id');

		try{

			Reviews::find($id)->delete();
			$response['success'] = [
				'message' => "Review successfully deleted."
			];
			return Response::json($response, 200);
		}catch(Exception $e){
			$response['error'] = [
				'message' => $e->getMessage()
			];
			return Response::json($response, 404);
		}
	}

	public function addAReview(Request $request) {
		$params = $request->all();
		$businessId = $params['businessId'];
		return view('review_business', compact('businessId'));
	}

	public function create(Request $request) {
		$latestRow = DB::table('reviews')->select('id', 'reviewer_id')->orderBy('id', 'desc')->first();
		$params = $request->all();	
		$reviewId = $latestRow->id;
		$reviewerId = $latestRow->reviewer_id;
		$businessId = $params['tradesman_id'];

		$communication = isset($params['communication']) ? $params['communication'] : NULL;
		$workQuality = isset($params['work-quality']) ? $params['work-quality'] : NULL;
		$price = isset($params['price']) ? $params['price'] : NULL;
		$punctuality = isset($params['punctuality']) ? $params['punctuality'] : NULL;
		$attitude = isset($params['attitude']) ? $params['attitude'] : NULL;
		$reviewTitle = isset($params['review-title']) ? $params['review-title'] : NULL;
		$reviewText = isset($params['review-text']) ? $params['review-text'] : NULL;
		$helpful = isset($params['helpful']) ? $params['helpful'] : NULL;
		
		$query = DB::table('reviews')->where('id', '=', $reviewId)->where('reviewer_id', '=', $reviewerId)
			->update(array(
				'reviewee_id' => $businessId,
				'communication' => $communication,
				'work_quality' => $workQuality,
				'price' => $price,
				'punctuality' => $punctuality,
				'attitude' => $attitude,
				'title' => $reviewTitle,
				'content' => $reviewText,
				'helpful' => $helpful,
				'updated_at' => Carbon::now()
		));
		return redirect('/');

	}
	
}
